<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foodie Finds - Influencer Food Recommendations</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f8fafc;
        }
        
        .skeleton {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            background-color: #e2e8f0;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .location-pulse {
            animation: pulse 2s infinite, ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        @keyframes ping {
            75%, 100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }
        
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .transition-all {
            transition: all 0.3s ease;
        }
    </style>
</head>
<body class="min-h-screen">
    <!-- Main Container -->
    <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-800 mb-2">Foodie Finds</h1>
            <p class="text-lg text-gray-600">Discover the best eats recommended by your favorite influencers</p>
        </header>
        
        <!-- App Content -->
        <div id="app">
            <!-- Homepage (Initial State) -->
            <div id="homepage" class="text-center">
                <div class="bg-white rounded-xl shadow-md p-8 mb-8 max-w-md mx-auto">
                    <div class="w-24 h-24 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-utensils text-white text-4xl"></i>
                    </div>
                    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Find Nearby Eats</h2>
                    <p class="text-gray-600 mb-6">Get personalized food recommendations from influencer FoodieEmma based on your current location.</p>
                    <button id="findFoodBtn" class="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-all">
                        <i class="fas fa-location-arrow mr-2"></i> Find Food Near Me
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-pink-500 mb-2">
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                            <i class="fas fa-star"></i>
                        </div>
                        <p class="text-gray-700">"FoodieEmma's recommendations never disappoint!"</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-pink-500 mb-2">
                            <i class="fas fa-route"></i>
                        </div>
                        <p class="text-gray-700">All recommendations within 30 minutes from you</p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow-sm">
                        <div class="text-pink-500 mb-2">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <p class="text-gray-700">Only places personally reviewed by FoodieEmma</p>
                    </div>
                </div>
            </div>
            
            <!-- Location Permission Modal -->
            <div id="locationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 hidden">
                <div class="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-map-marker-alt text-blue-500 text-2xl location-pulse"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Enable Location Access</h3>
                        <p class="text-gray-600">We need your location to find the best food spots near you. Your data is never stored or shared.</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <button id="denyLocationBtn" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-all">
                            Not Now
                        </button>
                        <button id="allowLocationBtn" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all">
                            Allow Location
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Loading State -->
            <div id="loadingState" class="hidden">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-spinner text-blue-500 text-2xl animate-spin"></i>
                    </div>
                    <h2 class="text-2xl font-semibold text-gray-800 mb-2">Finding the best eats near you</h2>
                    <p class="text-gray-600">We're searching FoodieEmma's recommendations in your area...</p>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Skeleton Loaders -->
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full skeleton"></div>
                            <div class="ml-3">
                                <div class="w-32 h-4 skeleton mb-2"></div>
                                <div class="w-24 h-3 skeleton"></div>
                            </div>
                        </div>
                        <div class="w-full h-4 skeleton mb-2"></div>
                        <div class="w-3/4 h-4 skeleton mb-4"></div>
                        <div class="w-24 h-3 skeleton"></div>
                    </div>
                    
                    <div class="bg-white rounded-xl shadow-sm p-6">
                        <div class="flex items-center mb-4">
                            <div class="w-12 h-12 rounded-full skeleton"></div>
                            <div class="ml-3">
                                <div class="w-32 h-4 skeleton mb-2"></div>
                                <div class="w-24 h-3 skeleton"></div>
                            </div>
                        </div>
                        <div class="w-full h-4 skeleton mb-2"></div>
                        <div class="w-3/4 h-4 skeleton mb-4"></div>
                        <div class="w-24 h-3 skeleton"></div>
                    </div>
                </div>
            </div>
            
            <!-- Results Page -->
            <div id="resultsPage" class="hidden">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-2xl font-semibold text-gray-800">
                        <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i> 
                        Recommendations Near You
                    </h2>
                    <div class="flex items-center">
                        <span class="text-sm text-gray-500 mr-2">Sorted by:</span>
                        <div class="relative">
                            <select class="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <option>Distance (nearest first)</option>
                                <option>Rating (highest first)</option>
                            </select>
                            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <i class="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="resultsContainer" class="grid grid-cols-1 gap-6">
                    <!-- Results will be inserted here by JavaScript -->
                </div>
                
                <div class="mt-8 text-center">
                    <button id="backToHomeBtn" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-all">
                        <i class="fas fa-arrow-left mr-2"></i> Back to Home
                    </button>
                </div>
            </div>
            
            <!-- Error State -->
            <div id="errorState" class="hidden">
                <div class="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto text-center">
                    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Location Access Required</h3>
                    <p class="text-gray-600 mb-6">We couldn't access your location. Please enable location services in your browser settings to get personalized recommendations.</p>
                    <button id="tryAgainBtn" class="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all">
                        <i class="fas fa-sync-alt mr-2"></i> Try Again
                    </button>
                </div>
            </div>
            
            <!-- No Results State -->
            <div id="noResultsState" class="hidden">
                <div class="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto text-center">
                    <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-search text-yellow-500 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">No Nearby Spots Found</h3>
                    <p class="text-gray-600 mb-6">We couldn't find any FoodieEmma-recommended places within 30 minutes of your location. Check back later as we add more recommendations!</p>
                    <button id="backToHomeBtn2" class="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all">
                        <i class="fas fa-home mr-2"></i> Back to Home
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <footer class="mt-16 text-center text-gray-500 text-sm">
            <p>© 2023 Foodie Finds. All recommendations are from influencer FoodieEmma.</p>
            <p class="mt-1">This is a demo application. No real location data is stored.</p>
        </footer>
    </div>

    <script>
        // Sample data - in a real app this would come from an API
        const foodPlaces = [
            {
                id: "1",
                name: "Spicy Noodle House",
                influencer: "FoodieEmma",
                coordinates: { lat: 40.7128, lng: -74.0060 },
                rating: 5,
                review: "The dan dan noodles here are absolutely incredible! Perfect spice level and the noodles have the perfect chew.",
                image: "https://images.unsplash.com/photo-1555126634-323283dd4c54?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: "2",
                name: "Sushi Haven",
                influencer: "FoodieEmma",
                coordinates: { lat: 40.7200, lng: -74.0100 },
                rating: 4,
                review: "Their omakase is a steal for the quality. The toro melts in your mouth like butter!",
                image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: "3",
                name: "The Burger Joint",
                influencer: "FoodieEmma",
                coordinates: { lat: 40.7150, lng: -74.0050 },
                rating: 4,
                review: "Juicy, messy, delicious. Their secret sauce makes these burgers next level.",
                image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: "4",
                name: "Pizza Palace",
                influencer: "FoodieEmma",
                coordinates: { lat: 40.7080, lng: -74.0150 },
                rating: 5,
                review: "The perfect NY slice - thin crust, slightly charred, with the right cheese-to-sauce ratio.",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            },
            {
                id: "5",
                name: "Taco Fiesta",
                influencer: "FoodieEmma",
                coordinates: { lat: 40.7050, lng: -74.0080 },
                rating: 4,
                review: "Authentic street-style tacos with homemade tortillas. The al pastor is a must-try!",
                image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
            }
        ];

        // DOM Elements
        const homepage = document.getElementById('homepage');
        const locationModal = document.getElementById('locationModal');
        const loadingState = document.getElementById('loadingState');
        const resultsPage = document.getElementById('resultsPage');
        const errorState = document.getElementById('errorState');
        const noResultsState = document.getElementById('noResultsState');
        const resultsContainer = document.getElementById('resultsContainer');
        
        // Buttons
        const findFoodBtn = document.getElementById('findFoodBtn');
        const allowLocationBtn = document.getElementById('allowLocationBtn');
        const denyLocationBtn = document.getElementById('denyLocationBtn');
        const tryAgainBtn = document.getElementById('tryAgainBtn');
        const backToHomeBtn = document.getElementById('backToHomeBtn');
        const backToHomeBtn2 = document.getElementById('backToHomeBtn2');

        // Event Listeners
        findFoodBtn.addEventListener('click', showLocationModal);
        allowLocationBtn.addEventListener('click', requestLocation);
        denyLocationBtn.addEventListener('click', hideLocationModal);
        tryAgainBtn.addEventListener('click', requestLocation);
        backToHomeBtn.addEventListener('click', resetToHomepage);
        backToHomeBtn2.addEventListener('click', resetToHomepage);

        // Show location permission modal
        function showLocationModal() {
            locationModal.classList.remove('hidden');
        }

        // Hide location permission modal
        function hideLocationModal() {
            locationModal.classList.add('hidden');
        }

        // Request user's location
        function requestLocation() {
            hideLocationModal();
            homepage.classList.add('hidden');
            loadingState.classList.remove('hidden');
            
            // Simulate loading delay
            setTimeout(() => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        position => {
                            // Success - got location
                            const userLocation = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                            processRecommendations(userLocation);
                        },
                        error => {
                            // Error getting location
                            showErrorState();
                        }
                    );
                } else {
                    // Geolocation not supported
                    showErrorState();
                }
            }, 1500);
        }

        // Process recommendations based on user location
        function processRecommendations(userLocation) {
            // Calculate distances and filter places within 30 minutes
            const placesWithDistance = foodPlaces.map(place => {
                // In a real app, we would use a proper distance calculation
                // For this demo, we'll simulate distances
                const distance = calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    place.coordinates.lat, 
                    place.coordinates.lng
                );
                
                // Convert distance to minutes (simplified for demo)
                const minutesAway = Math.round(distance * 10);
                
                return {
                    ...place,
                    distance: distance,
                    minutesAway: minutesAway
                };
            }).filter(place => place.minutesAway <= 30)
              .sort((a, b) => a.minutesAway - b.minutesAway);
            
            // Hide loading state
            loadingState.classList.add('hidden');
            
            if (placesWithDistance.length > 0) {
                // Show results
                displayResults(placesWithDistance);
                resultsPage.classList.remove('hidden');
            } else {
                // Show no results state
                noResultsState.classList.remove('hidden');
            }
        }

        // Display results
        function displayResults(places) {
            resultsContainer.innerHTML = '';
            
            places.forEach(place => {
                const placeCard = document.createElement('div');
                placeCard.className = 'bg-white rounded-xl shadow-sm overflow-hidden transition-all card-hover';
                placeCard.innerHTML = `
                    <div class="md:flex">
                        <div class="md:w-1/3 h-48 md:h-auto">
                            <img src="${place.image}" alt="${place.name}" class="w-full h-full object-cover">
                        </div>
                        <div class="p-6 md:w-2/3">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-semibold text-gray-800">${place.name}</h3>
                                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    ${place.minutesAway} mins away
                                </span>
                            </div>
                            
                            <div class="flex items-center mb-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center text-white">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-gray-800">FoodieEmma</p>
                                    <div class="flex">
                                        ${Array(place.rating).fill('<i class="fas fa-star text-yellow-400 text-xs"></i>').join('')}
                                        ${Array(5 - place.rating).fill('<i class="far fa-star text-yellow-400 text-xs"></i>').join('')}
                                    </div>
                                </div>
                            </div>
                            
                            <p class="text-gray-600 text-sm mb-4">"${place.review}"</p>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">
                                    <i class="fas fa-map-marker-alt mr-1"></i> ${place.minutesAway * 0.8} miles
                                </span>
                                <button class="text-sm font-medium text-pink-500 hover:text-pink-600 transition-all">
                                    View Details <i class="fas fa-chevron-right ml-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                resultsContainer.appendChild(placeCard);
            });
        }

        // Show error state
        function showErrorState() {
            loadingState.classList.add('hidden');
            errorState.classList.remove('hidden');
        }

        // Reset to homepage
        function resetToHomepage() {
            homepage.classList.remove('hidden');
            resultsPage.classList.add('hidden');
            errorState.classList.add('hidden');
            noResultsState.classList.add('hidden');
        }

        // Helper function to calculate distance between two coordinates (simplified)
        function calculateDistance(lat1, lon1, lat2, lon2) {
            // In a real app, use Haversine formula
            // This is a simplified version for demo purposes
            return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 100;
        }
    </script>
</body>
</html>