import React, { useState, useMemo } from 'react';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { foodPlaces } from './data';
import ReloadPrompt from './components/ReloadPrompt';

// --- Enhanced Travel Time Estimation Constants ---

// Blend ratio between vincenty and Manhattan distances
const BLEND_RATIO = 0.5; // 0.5 = equal weight

// Curvature penalty factor
const CURVATURE_FACTOR = 1.1;

// Dynamic speed function parameters
const BASE_SPEED = 20; // km/h, typical city speed
const MAX_SPEED = 60;  // km/h, expressway speed
const SPEED_K = 0.3;   // controls transition sharpness

// Road hierarchy speed adjustment factors based on trip length (km)
const TURN_TIME_SEC = 10; // seconds per expected turn

// Traffic light delay estimation (removed)

// Day/night adjustment factors (removed)

// Time of day and weekday/weekend factors
const TIME_FACTORS = {
  weekday_peak: 1.2,
  weekday_offpeak: 1.0,
  weekend_peak: 1.1,
  weekend_offpeak: 1.0
};

// Simple route complexity penalty (e.g., river crossing)
const ROUTE_COMPLEXITY_PENALTY = 1.1; // 10% increase if complex

// Helper: degrees to km (approximate, Singapore latitude)
const KM_PER_DEG_LAT = 111.32;
const KM_PER_DEG_LON = 111.32 * Math.cos(1.3 * Math.PI / 180); // ~cos(latitude in radians)

function vincentyDistance(lat1, lon1, lat2, lon2) {
  const a = 6378137;
  const f = 1 / 298.257223563;
  const b = 6356752.314245;

  const toRad = angle => angle * Math.PI / 180;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const L = toRad(lon2 - lon1);

  const U1 = Math.atan((1 - f) * Math.tan(φ1));
  const U2 = Math.atan((1 - f) * Math.tan(φ2));

  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  let λ = L, λPrev, iterLimit = 100;
  let sinλ, cosλ, sinσ, cosσ, σ, sinα, cos2α, cos2σm, C;

  do {
    sinλ = Math.sin(λ);
    cosλ = Math.cos(λ);
    sinσ = Math.sqrt(
      (cosU2 * sinλ) * (cosU2 * sinλ) +
      (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) *
      (cosU1 * sinU2 - sinU1 * cosU2 * cosλ)
    );
    if (sinσ === 0) return 0;
    cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
    σ = Math.atan2(sinσ, cosσ);
    sinα = cosU1 * cosU2 * sinλ / sinσ;
    cos2α = 1 - sinα * sinα;
    cos2σm = cosσ - 2 * sinU1 * sinU2 / cos2α;
    if (isNaN(cos2σm)) cos2σm = 0;
    C = f / 16 * cos2α * (4 + f * (4 - 3 * cos2α));
    λPrev = λ;
    λ = L + (1 - C) * f * sinα * (
      σ + C * sinσ * (
        cos2σm + C * cosσ * (
          -1 + 2 * cos2σm * cos2σm
        )
      )
    );
  } while (Math.abs(λ - λPrev) > 1e-12 && --iterLimit > 0);

  if (iterLimit === 0) return NaN;

  const uSq = cos2α * (a * a - b * b) / (b * b);
  const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  const Δσ = B * sinσ * (
    cos2σm + B / 4 * (
      cosσ * (-1 + 2 * cos2σm * cos2σm) -
      B / 6 * cos2σm * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σm * cos2σm)
    )
  );

  const dist = b * A * (σ - Δσ);
  return dist / 1000;
}

function App() {
  const [view, setView] = useState('home'); // home, loading, results, error, noresults
  const [results, setResults] = useState([]);
  const [sortOrder, setSortOrder] = useState('nearest');
  const [showRegionBanner, setShowRegionBanner] = useState(() => {
    // Only show on first visit per session
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("hideRegionBanner") !== "true";
    }
    return true;
  });

  // Track the kind of geolocation error to render better UX copy
  // Possible values: 'denied' | 'timeout' | 'unavailable' | 'unknown' | null
  const [errorKind, setErrorKind] = useState(null);
  // Show a small hint when watch fallback is active
  const [watching, setWatching] = useState(false);
  // Capture last geolocation error for debug
  const [lastError, setLastError] = useState(null); // { code, message } | null
  // Track Permissions API state if available
  const [permissionState, setPermissionState] = useState(null); // 'granted' | 'denied' | 'prompt' | 'unsupported' | null

  const probePermission = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((status) => {
          setPermissionState(status.state);
        }).catch(() => setPermissionState('unsupported'));
      } else {
        setPermissionState('unsupported');
      }
    } catch (_) {
      setPermissionState('unsupported');
    }
  };

  const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    // iPhone/iPad/iPod or iPadOS Safari (Mac platform + Mobile UA)
    return /iP(hone|od|ad)/.test(platform) || (/Mac/.test(platform) && /Mobile/.test(ua));
  };

  const handleDismissRegionBanner = () => {
    setShowRegionBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hideRegionBanner", "true");
    }
  };

  const requestLocation = () => {
    setView('loading');
    setErrorKind(null);
    setWatching(false);
    setLastError(null);
    setPermissionState(null);

    const onSuccess = (pos) => {
      const userLoc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      if (import.meta.env.DEV) {
        console.log('Detected user location:', userLoc.lat, userLoc.lng);
      }
      const nearby = foodPlaces.map(place => {
        const vincentyDist = vincentyDistance(
          userLoc.lat, userLoc.lng,
          place.coordinates.lat, place.coordinates.lng
        );

        // Manhattan distance approximation
        const dLat = Math.abs(userLoc.lat - place.coordinates.lat) * KM_PER_DEG_LAT;
        const dLon = Math.abs(userLoc.lng - place.coordinates.lng) * KM_PER_DEG_LON;
        const manhattanDist = dLat + dLon;

        // Blend vincenty and Manhattan
        let blendedDist = BLEND_RATIO * vincentyDist + (1 - BLEND_RATIO) * manhattanDist;

        // Apply curvature penalty
        blendedDist *= CURVATURE_FACTOR;

        // --- Dynamic speed calculation ---
        let avgSpeed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * (1 - Math.exp(-SPEED_K * blendedDist));

        // --- Turn penalty estimation ---
        const estimatedTurns = Math.max(1, Math.round((dLat + dLon) / 0.5)); // assume 1 turn per 0.5 km of grid distance
        const turnDelayMinutes = (TURN_TIME_SEC * estimatedTurns) / 60;

        // --- Time of day adjustment ---
        const now = new Date();
        const hour = now.getHours();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6;
        const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);

        let timeKey = '';
        if (isWeekend) {
          timeKey = isPeak ? 'weekend_peak' : 'weekend_offpeak';
        } else {
          timeKey = isPeak ? 'weekday_peak' : 'weekday_offpeak';
        }
        const timeFactor = TIME_FACTORS[timeKey];

        // --- Route complexity penalty ---
        // Placeholder: assume all routes cross a river (for demo)
        const complexityFactor = ROUTE_COMPLEXITY_PENALTY;

        // --- Final ETA ---
        const adjustedDistance = blendedDist * timeFactor * complexityFactor;
        let etaMinutes = (adjustedDistance / avgSpeed) * 60;

        // Add turn delay only
        etaMinutes += turnDelayMinutes;

        return {
          ...place,
          distanceKm: adjustedDistance,
          minutesAway: Math.round(etaMinutes)
        };
      }).filter(p => p.minutesAway <= 60);

      if (nearby.length > 0) {
        setResults(nearby);
        setView('results');
      } else {
        setView('noresults');
      }
    };

    const fastOptions = { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 };
    const retryOptions = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (err) => {
        if (import.meta.env.DEV) {
          console.warn('Geolocation (fast) failed:', err?.code, err?.message);
        }
        // Permission denied: show permission guidance
        if (err && err.code === 1) {
          setLastError({ code: err.code, message: err.message });
          setErrorKind('denied');
          probePermission();
          setView('error');
          return;
        }

        // Retry with high accuracy and longer timeout
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (err2) => {
            if (import.meta.env.DEV) {
              console.warn('Geolocation (retry) failed:', err2?.code, err2?.message);
            }
            // Final fallback: start a one-time watch to catch the first GPS fix, then clear it
            let resolved = false;
            let watchTimer;
            const watchOptions = { enableHighAccuracy: true, maximumAge: 0 };
            setWatching(true);
            const watchId = navigator.geolocation.watchPosition(
              (pos) => {
                if (resolved) return;
                resolved = true;
                navigator.geolocation.clearWatch(watchId);
                if (watchTimer) clearTimeout(watchTimer);
                setWatching(false);
                if (import.meta.env.DEV) {
                  console.log('Geolocation (watch) success');
                }
                onSuccess(pos);
              },
              (err3) => {
                if (import.meta.env.DEV) {
                  console.warn('Geolocation (watch) error:', err3?.code, err3?.message);
                }
                // If user denies permission during watch, stop immediately and surface proper message
                if (!resolved && err3 && err3.code === 1) {
                  resolved = true;
                  navigator.geolocation.clearWatch(watchId);
                  if (watchTimer) clearTimeout(watchTimer);
                  setWatching(false);
                  setLastError({ code: err3.code, message: err3.message });
                  setErrorKind('denied');
                  probePermission();
                  setView('error');
                }
              },
              watchOptions
            );
            watchTimer = setTimeout(() => {
              if (resolved) return;
              resolved = true;
              navigator.geolocation.clearWatch(watchId);
              setWatching(false);
              if (err2) {
                setLastError({ code: err2.code, message: err2.message });
                if (err2.code === 2) setErrorKind('unavailable');
                else if (err2.code === 3) setErrorKind('timeout');
                else setErrorKind('unknown');
              } else {
                setLastError({ code: 3, message: 'Timeout' });
                setErrorKind('timeout');
              }
              probePermission();
              setView('error');
            }, 45000);
          },
          retryOptions
        );
      },
      fastOptions
    );
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (sortOrder === 'nearest') return a.minutesAway - b.minutesAway;
      else return b.minutesAway - a.minutesAway;
    });
  }, [results, sortOrder]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        {showRegionBanner && (
          <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 px-4 py-2 flex items-center justify-center text-sm mb-4 rounded-t-lg shadow-sm">
            <div className="flex flex-col items-center w-full text-center">
              <span>
                <strong>hey Hungry Friend !</strong>
                <br />
                imHungryAF is currently serving up recommendations only in <b>Singapore</b> and <b>Kuala Lumpur, Malaysia</b> for now.
                <br />
                more cities coming soon...
              </span>
            </div>
            <button
              className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold text-lg self-start"
              aria-label="Dismiss region notice"
              onClick={handleDismissRegionBanner}
              style={{ marginLeft: 'auto' }}
            >
              ×
            </button>
          </div>
        )}
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-utensils text-white text-2xl"></i>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 cursor-pointer" onClick={() => setView('home')}>imHungryAF</h1>
            </div>
            <p className="text-lg text-gray-600 mt-4">Discover the best eats recommended by your favorite influencers</p>
        </header>

        {view === 'home' && (
            <div className="text-center">
                <div className="bg-white rounded-xl shadow-md p-10 mb-8 max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-utensils text-white text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Nearby Eats</h2>
                    <p className="text-gray-600 mb-6">Get personalized food recommendations from influencers within 60 minutes driving distance based on your current location.</p>
                    <button onClick={requestLocation} className="icon-text bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all">
                        <i className="fa-solid fa-location-arrow"></i> Find Food Near Me
                    </button>
                </div>
            </div>
        )}

        {view === 'home' && (
            <div className="text-center">
                {/* Updated Featured Food Influencer Section */}
                <div className="flex flex-col items-center justify-center my-6">
                    {/* Parent div for images and text section */}
                    <div className="flex flex-col md:flex-row items-center justify-center">
                        {/* Image section */}
                        <div className="flex -space-x-3 mb-2 md:mb-0 md:mr-6">
                            <img
                                src="/images/zermattneo.jpg"
                                alt="Zermatt Neo"
                                className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-white object-cover"
                                style={{ zIndex: 1 }}
                                loading="lazy"
                                decoding="async"
                                width="48"
                                height="48"
                            />
                            <img
                                src="/images/mingchun.jpg"
                                alt="Ming Chun"
                                className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-white object-cover"
                                style={{ zIndex: 2 }}
                                loading="lazy"
                                decoding="async"
                                width="48"
                                height="48"
                            />
                            <img
                                src="/images/hungrysam.jpg"
                                alt="Hungry Sam"
                                className="w-12 h-12 rounded-full border-2 border-white shadow-md bg-white object-cover"
                                style={{ zIndex: 3 }}
                                loading="lazy"
                                decoding="async"
                                width="48"
                                height="48"
                            />
                        </div>

                        {/* Text section */}
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-800 text-sm md:text-base">
                                    Featured Food Influencers
                                </span>
                                <span title="YouTube" className="text-red-500">
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="inline-block align-middle"
                                    >
                                        <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.12C19.228 3.5 12 3.5 12 3.5s-7.228 0-9.386.566A2.994 2.994 0 0 0 .502 6.186C0 8.344 0 12 0 12s0 3.656.502 5.814a2.994 2.994 0 0 0 2.112 2.12C4.772 20.5 12 20.5 12 20.5s7.228 0 9.386-.566a2.994 2.994 0 0 0 2.112-2.12C24 15.656 24 12 24 12s0-3.656-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                    </svg>
                                </span>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 text-center md:text-left">
                                Zermatt Neo 🇸🇬 • Ming Chun 🇲🇾 • Hungry Sam 🇲🇾
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {view === 'home' && (
          <>
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="text-pink-500 mb-2">
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                  <i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-700">"imHungryAF's recommendations never disappoint!"</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="text-pink-500 mb-2">
                  <i className="fa-solid fa-route"></i>
                </div>
                <p className="text-gray-700">All recommendations within 60 minutes driving distance from you</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="text-pink-500 mb-2">
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <p className="text-gray-700">Only places personally reviewed by food influencers</p>
              </div>
            </div>
          </>
        )}

        {view === 'loading' && (
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-spinner text-blue-500 text-2xl animate-spin"></i>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Finding the best eats near you</h2>
                <p className="text-gray-600">We're searching imHungryAF's recommendations in your area...</p>
                {watching && (
                  <p className="text-xs text-gray-500 mt-2 icon-text">
                    <span className="w-2 h-2 rounded-full bg-blue-400 location-pulse"></span>
                    Trying to get a GPS fix…
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {[1,2].map(i => (
                        <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full skeleton"></div>
                                <div className="ml-3">
                                    <div className="w-32 h-4 skeleton mb-2"></div>
                                    <div className="w-24 h-3 skeleton"></div>
                                </div>
                            </div>
                            <div className="w-full h-4 skeleton mb-2"></div>
                            <div className="w-3/4 h-4 skeleton mb-4"></div>
                            <div className="w-24 h-3 skeleton"></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {view === 'results' && (
            <>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-7">
                    <h2 className="text-xl md:text-3xl font-semibold text-gray-900 mb-4 md:mb-0 flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-blue-500"></i>
                        <span>Nearby Recommendations</span>
                    </h2>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Sorted by:</span>
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={e => setSortOrder(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="nearest">Distance (nearest first)</option>
                                <option value="furthest">Distance (furthest first)</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {sortedResults.map(place => (
                        <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all card-hover restaurant-card">
                            {/* Schema markup - invisible to users but visible to search engines */}
                            <script type="application/ld+json">
                              {JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "FoodEstablishment",
                                "name": place.name,
                                "image": place.image,
                                "address": {
                                  "@type": "PostalAddress",
                                  "addressCountry": place.coordinates.lat > 1.3 ? "SG" : "MY",
                                  "addressRegion": place.coordinates.lat > 1.3 ? "Singapore" : "Kuala Lumpur"
                                },
                                "geo": {
                                  "@type": "GeoCoordinates",
                                  "latitude": place.coordinates.lat,
                                  "longitude": place.coordinates.lng
                                },
                                "review": {
                                  "@type": "Review",
                                  "reviewRating": {
                                    "@type": "Rating",
                                    "ratingValue": place.rating.toString(),
                                    "bestRating": "5"
                                  },
                                  "author": {
                                    "@type": "Person",
                                    "name": place.influencer,
                                    "image": place.profilephoto || undefined
                                  },
                                  "reviewBody": place.review.substring(0, 200) + (place.review.length > 200 ? "..." : "")
                                },
                                "sameAs": place.googlemaps
                              })}
                            </script>
                            <div className="md:flex">
                                <div className="md:w-1/3 h-48 md:h-auto">
                                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" loading="lazy" decoding="async" width="640" height="480" />
                                </div>
                                <div className="p-6 md:w-2/3 flex items-center justify-center flex-col">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 w-full">
                                        <h3 className="text-xl font-semibold text-gray-800">{place.name}</h3>
                                        <span className="mt-4 mb-3 sm:mt-0 bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full sm:inline-block text-center">
                                            {place.minutesAway} mins away
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-4 w-full">
                                        {place.profilephoto ? (
                                            <img src={place.profilephoto} alt={place.influencer} className="w-10 h-10 rounded-full object-cover" loading="lazy" decoding="async" width="40" height="40" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white">
                                                <i className="fa-solid fa-user"></i>
                                            </div>
                                        )}
                                        <div className="ml-3">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm font-medium text-gray-800">{place.influencer}</p>
                                                <i className="fa-solid fa-check-circle text-blue-500 text-xs"></i>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex">
                                                    {Array(place.rating).fill(0).map((_,i) => (
                                                        <i key={i} className="fa-solid fa-star text-yellow-400 text-xs"></i>
                                                    ))}
                                                    {Array(5 - place.rating).fill(0).map((_,i) => (
                                                        <i key={i} className="fa-regular fa-star text-yellow-400 text-xs"></i>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-1">{place.rating}.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 text-center">"{place.review}"</p>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="icon-text text-xs text-gray-500">
                                            <i className="fa-solid fa-location-dot"></i> {place.distanceKm.toFixed(2)} km
                                        </span>
                                        {place.googlemaps ? (
                                            <a href={place.googlemaps} target="_blank" rel="noopener noreferrer" className="icon-text text-sm font-medium text-blue-500 hover:text-blue-600 transition-all">
                                                <i className="fa-solid fa-map-location-dot"></i> View on Maps
                                            </a>
                                        ) : (
                                            <span className="text-sm text-gray-400">No map available</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => setView('home')} className="icon-text bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-all">
                        <i className="fa-solid fa-arrow-left"></i> Back to Home
                    </button>
                </div>
            </>
        )}

        {view === 'error' && (
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {errorKind === 'denied' ? 'Location Access Required' : "Couldn't get your location"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {errorKind === 'denied' && (
                    <>We don't have permission to use your location. Enable it for your browser in Settings, then return and try again.</>
                  )}
                  {errorKind === 'timeout' && (
                    <>It took too long to get a GPS fix. Please try again in an open area or check your connection.</>
                  )}
                  {errorKind === 'unavailable' && (
                    <>Location is temporarily unavailable. Move to an open area or try again shortly.</>
                  )}
                  {(!errorKind || errorKind === 'unknown') && (
                    <>We couldn't access your location. Please try again.</>
                  )}
                </p>
                {errorKind === 'denied' && isIOS() && (
                  <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 text-left -mt-4 mb-6">
                    <p className="icon-text font-medium text-gray-800 mb-2">
                      <i className="fa-solid fa-mobile-screen-button"></i>
                      iOS: enable Safari location prompts again
                    </p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Open <span className="font-medium">Settings</span></li>
                      <li>Tap <span className="font-medium">Privacy & Security</span></li>
                      <li>Tap <span className="font-medium">Location Services</span></li>
                      <li>Tap <span className="font-medium">Safari Websites</span></li>
                      <li>Select <span className="font-medium">Ask Next Time Or When I Share</span> or <span className="font-medium">While Using the App</span></li>
                      <li>Return here and tap <span className="font-medium">Try Again</span></li>
                    </ol>
                    <p className="text-[11px] text-gray-500 mt-2">If it still doesn't prompt, close this tab and reopen the site.</p>
                  </div>
                )}
                {import.meta.env.DEV && (lastError || permissionState) && (
                  <p className="text-[11px] text-gray-400 font-mono mt-1 mb-3">
                    {lastError ? `err ${lastError.code}: ${lastError.message}` : ''}
                    {permissionState ? `${lastError ? ' | ' : ''}perm: ${permissionState}` : ''}
                  </p>
                )}
                <div className="flex items-center justify-center gap-3">
                  <button onClick={requestLocation} className="icon-text bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all">
                    <i className="fa-solid fa-location-arrow"></i> Try Again
                  </button>
                  <button onClick={() => window.location.reload()} className="icon-text bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-all">
                    <i className="fa-solid fa-arrows-rotate"></i> Refresh Page
                  </button>
                </div>
            </div>
        )}

        {view === 'noresults' && (
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-solid fa-search text-yellow-500 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Nearby Spots Found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any imHungryAF recommended places within 60 minutes of your location. Check back later as we add more recommendations!</p>
                <button onClick={() => setView('home')} className="icon-text bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all">
                    <i className="fa-solid fa-home"></i> Back to Home
                </button>
            </div>
        )}

        {/* PWA update/offline toasts */}
        <ReloadPrompt />

        {/* PWA Install Prompt (Android/iOS tailored) */}
        <PWAInstallPrompt currentView={view} />

        <footer className="mt-16 text-center text-gray-500 text-sm">
            <p> 2025 imHungryAF. All food recommendations are reviewed by influencers, data manually curated and web app made by <a href="https://www.craftedbyhan.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">han</a> .</p>
            <p className="mt-3">This application uses your current location to find nearby recommendations within a 60-minute drive based on typical urban traffic conditions. Your location data is not stored as it is unnecessary.</p>
            <br />
            <small>
                This app estimates travel time without relying on external APIs or large country-specific datasets. It combines geodesic and grid-based distance formulas with heuristic adjustments for turns, time of day, curvature penalties, and dynamic speed modeling. The approach excludes detailed road hierarchy, traffic light delays, and day/night factors for simplicity. This lightweight method provides realistic ETAs while respecting user privacy and minimizing data usage.
            </small>
        </footer>
    </div>
);
}

export default App;