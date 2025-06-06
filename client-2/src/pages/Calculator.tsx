import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Navigation, Zap, TrendingDown, Target, AlertCircle, History, Bookmark, Share2, Calculator as CalcIcon } from 'lucide-react';
import Map from '../components/Map';
import RouteCard from '../components/RouteCard';
import { Route, TollPoint } from '../types';

const Calculator: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>();
  const [isCalculating, setIsCalculating] = useState(false);
  const [vehicleType, setVehicleType] = useState<'car' | 'truck' | 'motorcycle'>('car');
  const [routePreference, setRoutePreference] = useState<'cheapest' | 'fastest' | 'balanced'>('balanced');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'New York, NY → Philadelphia, PA',
    'San Francisco, CA → Los Angeles, CA',
    'Boston, MA → Washington, DC'
  ]);

  // Mock data for demonstration
  const mockRoutes: Route[] = [
    {
      id: '1',
      name: 'I-95 Express',
      distance: 45.2,
      duration: 38,
      cost: 12.50,
      type: 'fastest',
      coordinates: [
        [40.7128, -74.0060],
        [40.7589, -73.9851],
        [40.8176, -73.9442],
        [40.8736, -73.9104]
      ],
      tolls: [
        { id: 't1', name: 'Lincoln Tunnel', location: [40.7589, -73.9851], cost: 8.50, vehicleType: 'car' },
        { id: 't2', name: 'GW Bridge', location: [40.8176, -73.9442], cost: 4.00, vehicleType: 'car' }
      ]
    },
    {
      id: '2',
      name: 'Route 1 Local',
      distance: 52.8,
      duration: 65,
      cost: 8.25,
      type: 'cheapest',
      coordinates: [
        [40.7128, -74.0060],
        [40.7400, -74.0200],
        [40.7800, -74.0100],
        [40.8200, -73.9800],
        [40.8736, -73.9104]
      ],
      tolls: [
        { id: 't3', name: 'Holland Tunnel', location: [40.7400, -74.0200], cost: 8.25, vehicleType: 'car' }
      ]
    },
    {
      id: '3',
      name: 'Balanced Route',
      distance: 48.5,
      duration: 52,
      cost: 10.75,
      type: 'balanced',
      coordinates: [
        [40.7128, -74.0060],
        [40.7350, -73.9950],
        [40.7680, -73.9650],
        [40.8100, -73.9300],
        [40.8736, -73.9104]
      ],
      tolls: [
        { id: 't4', name: 'Queens Midtown', location: [40.7350, -73.9950], cost: 6.50, vehicleType: 'car' },
        { id: 't5', name: 'Triboro Bridge', location: [40.7680, -73.9650], cost: 4.25, vehicleType: 'car' }
      ]
    }
  ];

  const calculateRoutes = async () => {
    if (!origin || !destination) return;
    
    setIsCalculating(true);
    
    // Add to recent searches
    const searchQuery = `${origin} → ${destination}`;
    setRecentSearches(prev => [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5));
    
    // Simulate API call
    setTimeout(() => {
      setRoutes(mockRoutes);
      // Auto-select based on preference
      const preferredRoute = mockRoutes.find(r => r.type === routePreference) || mockRoutes[0];
      setSelectedRoute(preferredRoute);
      setIsCalculating(false);
    }, 2000);
  };

  const handleTollClick = (toll: TollPoint) => {
    // Handle toll point click - could open dispute modal
    console.log('Toll clicked:', toll);
  };

  const saveRoute = () => {
    if (selectedRoute) {
      // Save route logic
      console.log('Saving route:', selectedRoute);
    }
  };

  const shareRoute = () => {
    if (selectedRoute) {
      // Share route logic
      navigator.share?.({
        title: `${selectedRoute.name} - TollCalc Pro`,
        text: `Check out this route: ${selectedRoute.distance} miles, ${selectedRoute.duration} minutes, $${selectedRoute.cost}`,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
            Smart Toll Calculator
          </h1>
          <p className="text-gray-600 text-lg">Find the best route for your journey with real-time toll pricing</p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Navigation className="absolute left-3 top-3 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="From (Origin)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="To (Destination)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="motorcycle">Motorcycle</option>
            </select>

            <select
              value={routePreference}
              onChange={(e) => setRoutePreference(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="balanced">Balanced</option>
              <option value="cheapest">Cheapest</option>
              <option value="fastest">Fastest</option>
            </select>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={calculateRoutes}
              disabled={isCalculating || !origin || !destination}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
            >
              {isCalculating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Calculating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CalcIcon className="w-4 h-4 mr-2" />
                  Calculate
                </div>
              )}
            </motion.button>
          </div>

          {/* Quick Tips and Recent Searches */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Fastest</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span>Cheapest</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-blue-500" />
                <span>Balanced</span>
              </div>
            </div>

            {recentSearches.length > 0 && (
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">Recent:</span>
                <select 
                  onChange={(e) => {
                    const [from, to] = e.target.value.split(' → ');
                    setOrigin(from);
                    setDestination(to);
                  }}
                  className="text-sm border-none bg-transparent text-gray-600 cursor-pointer"
                >
                  <option value="">Select recent search</option>
                  {recentSearches.map((search, index) => (
                    <option key={index} value={search}>{search}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Section */}
        {routes.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Route Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-1 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Route Options</h2>
                {selectedRoute && (
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={saveRoute}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Bookmark className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={shareRoute}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>

              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={selectedRoute?.id === route.id}
                  onSelect={setSelectedRoute}
                />
              ))}
              
              {/* Cost Breakdown */}
              {selectedRoute && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-50 to-red-50 border border-blue-200 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-blue-800 mb-3">Cost Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    {selectedRoute.tolls.map((toll) => (
                      <div key={toll.id} className="flex justify-between">
                        <span className="text-blue-700">{toll.name}</span>
                        <span className="font-medium">${toll.cost.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold">
                      <span>Total Tolls:</span>
                      <span>${selectedRoute.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Report Issues Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4"
              >
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-orange-800">Found an Issue?</h3>
                    <p className="text-sm text-orange-700 mb-2">
                      Report incorrect toll prices or missing toll booths
                    </p>
                    <button className="text-sm text-orange-600 hover:text-orange-800 font-medium underline">
                      Report Issue →
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-2 h-96 xl:h-[600px]"
            >
              <Map
                routes={routes}
                selectedRoute={selectedRoute}
                onTollClick={handleTollClick}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;