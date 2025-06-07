import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, Zap, Route, TrendingUp } from 'lucide-react';
import RouteCard from '../components/RouteCard';
import SearchForm from '../components/SearchForm';

interface RouteData {
  id: string;
  name: string;
  distance: number;
  duration: number;
  tollCost: number;
  fuelCost: number;
  totalCost: number;
  type: 'cheapest' | 'fastest' | 'balanced';
  savings?: number;
}

const Calculator = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchData, setSearchData] = useState({ from: '', to: '', vehicleType: 'car' });

  const mockRoutes: RouteData[] = [
    {
      id: '1',
      name: 'Fastest Route',
      distance: 245,
      duration: 180,
      tollCost: 28.50,
      fuelCost: 35.20,
      totalCost: 63.70,
      type: 'fastest',
    },
    {
      id: '2',
      name: 'Cheapest Route',
      distance: 280,
      duration: 220,
      tollCost: 12.25,
      fuelCost: 40.15,
      totalCost: 52.40,
      type: 'cheapest',
      savings: 11.30,
    },
    {
      id: '3',
      name: 'Balanced Route',
      distance: 260,
      duration: 195,
      tollCost: 18.75,
      fuelCost: 37.30,
      totalCost: 56.05,
      type: 'balanced',
      savings: 7.65,
    },
  ];

  const handleSearch = async (data: any) => {
    setSearchData(data);
    setIsCalculating(true);
    setRoutes([]);

    // Simulate API call
    setTimeout(() => {
      setRoutes(mockRoutes);
      setIsCalculating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <div className="relative bg-hero-pattern bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart Toll
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {' '}Calculator
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Find the perfect balance between cost and time. Compare routes instantly and save money on every journey.
            </p>
            <div className="flex justify-center items-center space-x-8 text-white/80">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Real-time Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Cost Optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <Route className="h-5 w-5" />
                <span>Multiple Routes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <SearchForm onSearch={handleSearch} />
        </motion.div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center space-x-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
              />
              <span className="text-lg text-gray-600">Calculating optimal routes...</span>
            </div>
          </motion.div>
        )}

        {routes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Route Comparison Results
              </h2>
              <p className="text-gray-600">
                From {searchData.from} to {searchData.to}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routes.map((route, index) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <RouteCard route={route} />
                </motion.div>
              ))}
            </div>

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8 mt-12"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Trip Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Best Savings</h4>
                  <p className="text-3xl font-bold text-green-600">$11.30</p>
                  <p className="text-gray-500">vs fastest route</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Time Range</h4>
                  <p className="text-3xl font-bold text-blue-600">3-3.7h</p>
                  <p className="text-gray-500">depending on route</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">Distance Range</h4>
                  <p className="text-3xl font-bold text-purple-600">245-280</p>
                  <p className="text-gray-500">miles total</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isCalculating && routes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <MapPin className="h-12 w-12 text-primary-600" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Start Your Journey
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Enter your departure and destination points above to discover the most efficient routes with detailed cost breakdowns.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Calculator;