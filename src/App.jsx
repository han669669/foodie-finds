import React, { useState } from 'react';

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
const ROAD_HIERARCHY_SPEED_ADJUST = [
  { maxDistance: 2, factor: 0.8 },    // mostly local roads, slower
  { maxDistance: 10, factor: 1.0 },   // mixed
  { maxDistance: Infinity, factor: 1.2 } // mostly expressways, faster
];

// Turn penalty estimation
const TURN_TIME_SEC = 10; // seconds per expected turn

// Traffic light delay estimation
const TRAFFIC_LIGHT_DELAY_SEC = 30; // seconds per expected light

// Day/night adjustment factors
const DAY_NIGHT_FACTORS = {
  day: 1.0,
  night: 0.9
};

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
import { foodPlaces } from './data';

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

  const requestLocation = () => {
    setView('loading');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        console.log('Detected user location:', userLoc.lat, userLoc.lng);
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

          // --- Road hierarchy influence ---
          const roadFactorObj = ROAD_HIERARCHY_SPEED_ADJUST.find(p => blendedDist <= p.maxDistance);
          avgSpeed *= roadFactorObj.factor;

          // --- Turn penalty estimation ---
          const estimatedTurns = Math.max(1, Math.round((dLat + dLon) / 0.5)); // assume 1 turn per 0.5 km of grid distance
          const turnDelayMinutes = (TURN_TIME_SEC * estimatedTurns) / 60;

          // --- Traffic light delay estimation ---
          const estimatedLights = Math.max(1, Math.round((dLat + dLon) / 0.5)); // assume 1 light per 0.5 km
          const lightDelayMinutes = (TRAFFIC_LIGHT_DELAY_SEC * estimatedLights) / 60;

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

          // --- Day/night adjustment ---
          const dayNightFactor = (hour >= 22 || hour <= 5) ? DAY_NIGHT_FACTORS.night : DAY_NIGHT_FACTORS.day;

          // --- Route complexity penalty ---
          // Placeholder: assume all routes cross a river (for demo)
          const complexityFactor = ROUTE_COMPLEXITY_PENALTY;

          // --- Final ETA ---
          const adjustedDistance = blendedDist * timeFactor * complexityFactor;
          let etaMinutes = (adjustedDistance / avgSpeed) * 60;

          // Add turn and traffic light delays
          etaMinutes += turnDelayMinutes + lightDelayMinutes;

          // Apply day/night factor
          etaMinutes *= dayNightFactor;

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
      },
      err => {
        console.error(err);
        setView('error');
      }
    );
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortOrder === 'nearest') return a.minutesAway - b.minutesAway;
    else return b.minutesAway - a.minutesAway;
  });

return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
            <div className="flex justify-center items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-utensils text-white text-2xl"></i>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 cursor-pointer" onClick={() => setView('home')}>imHungryAF</h1>
            </div>
            <p className="text-lg text-gray-600 mt-4">Discover the best eats recommended by your favorite influencers</p>
        </header>

        {view === 'home' && (
            <div className="text-center">
                <div className="bg-white rounded-xl shadow-md p-10 mb-8 max-w-md mx-auto">
                    <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-utensils text-white text-4xl"></i>
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Find Nearby Eats</h2>
                    <p className="text-gray-600 mb-6">Get personalized food recommendations from influencers within 60 minutes driving distance based on your current location.</p>
                    <button onClick={requestLocation} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all">
                        <i className="fas fa-location-arrow mr-2"></i> Find Food Near Me
                    </button>
                </div>
            </div>
        )}

        {view === 'home' && (
          <>
            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="text-pink-500 mb-2">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p className="text-gray-700">"imHungryAF's recommendations never disappoint!"</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="text-pink-500 mb-2">
                  <i className="fas fa-route"></i>
                </div>
                <p className="text-gray-700">All recommendations within 60 minutes driving distance from you</p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm flex flex-col items-center text-center">
                <div className="text-pink-500 mb-2">
                  <i className="fas fa-user-check"></i>
                </div>
                <p className="text-gray-700">Only places personally reviewed by food influencers</p>
              </div>
            </div>
          </>
        )}

        {view === 'loading' && (
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">Finding the best eats near you</h2>
                <p className="text-gray-600">We're searching imHungryAF's recommendations in your area...</p>
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
                        <i className="fas fa-map-marker-alt text-blue-500"></i>
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
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {sortedResults.map(place => (
                        <div key={place.id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all card-hover">
                            <div className="md:flex">
                                <div className="md:w-1/3 h-48 md:h-auto">
                                    <img src={place.image.startsWith('http') ? place.image : './' + place.image} alt={place.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 md:w-2/3 flex items-center justify-center flex-col">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 w-full">
                                        <h3 className="text-xl font-semibold text-gray-800">{place.name}</h3>
                                        <span className="mt-4 mb-3 sm:mt-0 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full sm:inline-block text-center">
                                            {place.minutesAway} mins away
                                        </span>
                                    </div>
                                    <div className="flex items-center mb-4 w-full">
                                        {place.profilephoto ? (
                                            <img src={place.profilephoto.startsWith('http') ? place.profilephoto : './' + place.profilephoto} alt={place.influencer} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white">
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                        <div className="ml-3">
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm font-medium text-gray-800">{place.influencer}</p>
                                                <i className="fas fa-check-circle text-blue-500 text-xs"></i>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="flex">
                                                    {Array(place.rating).fill(0).map((_,i) => (
                                                        <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                                                    ))}
                                                    {Array(5 - place.rating).fill(0).map((_,i) => (
                                                        <i key={i} className="far fa-star text-yellow-400 text-xs"></i>
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 ml-1">{place.rating}.0</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 text-center">"{place.review}"</p>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-xs text-gray-500">
                                            <i className="fas fa-map-marker-alt mr-1"></i> {place.distanceKm.toFixed(2)} km
                                        </span>
                                        {place.googlemaps ? (
                                            <a href={place.googlemaps} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-500 hover:text-blue-600 transition-all">
                                                <i className="fas fa-map-marked-alt mr-1"></i> View on Maps
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
                    <button onClick={() => setView('home')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-all">
                        <i className="fas fa-arrow-left mr-2"></i> Back to Home
                    </button>
                </div>
            </>
        )}

        {view === 'error' && (
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Location Access Required</h3>
                <p className="text-gray-600 mb-6">We couldn't access your location. Please enable location services in your browser settings and manually refresh the page to allow the location permission prompt to appear again.</p>
                <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all">
                <i className="fas fa-sync-alt mr-2"></i> Refresh Page
                </button>
            </div>
        )}

        {view === 'noresults' && (
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-search text-yellow-500 text-2xl"></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Nearby Spots Found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any imHungryAF recommended places within 60 minutes of your location. Check back later as we add more recommendations!</p>
                <button onClick={() => setView('home')} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all">
                    <i className="fas fa-home mr-2"></i> Back to Home
                </button>
            </div>
        )}

        <footer className="mt-16 text-center text-gray-500 text-sm">
            <p>© 2025 imHungryAF. All food recommendations are reviewed by influencers, data manually curated and web app made by <a href="https://www.craftedbyhan.xyz/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">han</a> 😊</p>
            <p className="mt-3">This application uses your current location to find nearby recommendations within a 60-minute drive based on typical urban traffic conditions. Your location data is not stored as it is unnecessary.</p>
            <br />
            <small>
                This app estimates travel time without relying on external APIs or large country-specific datasets. It combines geodesic and grid-based distance formulas with heuristic adjustments for road types, turns, traffic lights, and time of day. The calculations incorporate curvature penalties and dynamic speed modeling to better reflect real-world driving conditions. This lightweight approach provides realistic ETAs while respecting user privacy and minimizing data usage.
            </small>
        </footer>
    </div>
);
}

export default App;