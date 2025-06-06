import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, MapPin, Zap, TrendingDown, Target } from 'lucide-react';
import { IndianRupee } from 'lucide-react';

const RouteCard = ({ route, isSelected, onSelect }) => {
  const getRouteIcon = () => {
    switch (route.type) {
      case 'fastest':
        return <Zap className="w-5 h-5 text-orange-600 dark:text-white" />;
      case 'cheapest':
        return <TrendingDown className="w-5 h-5 text-green-600 dark:text-white" />;
      case 'best':
        return <Target className="w-5 h-5 text-blue-600 dark:text-white" />;
      default:
        return <MapPin className="w-5 h-5 text-gray-500 dark:text-white" />;
    }
  };

  const getRouteColor = () => {
    switch (route.type) {
      case 'fastest':
        return 'from-orange-500 to-red-500';
      case 'cheapest':
        return 'from-green-500 to-red-500';
      case 'best':
        return 'from-blue-500 to-red-500';
      default:
        return 'from-red-500 to-red-600';
    }
  };

  const numericDistance = parseFloat(route.distance.replace(/,/g, ''));

  const getLabel = () => {
    switch (route.type) {
      case 'fastest':
        return 'Fastest Route';
      case 'cheapest':
        return 'Cheapest Route';
      case 'best':
        return 'Best Route';
      default:
        return route.name || `Route ${route.routeIndex + 1}`;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(route)}
      className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl'
          : 'bg-white hover:bg-red-50 shadow-lg hover:shadow-xl dark:bg-gradient-to-r dark:from-black dark:to-red-900 dark:border-red-900 dark:text-red-100 dark:shadow-red-900'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              isSelected
                ? 'bg-white/20'
                : `bg-gradient-to-r ${getRouteColor()}`
            }`}
          >
            <div className="text-white">{getRouteIcon()}</div>
          </div>
          <div>
            <h3 className="font-bold text-lg">{route.name}</h3>
            <p
              className={`text-sm ${
                isSelected ? 'text-red-100' : 'text-gray-500'
              }`}
            >
              {route.type.charAt(0).toUpperCase() + route.type.slice(1)} Route
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Clock
            className={`w-4 h-4 ${
              isSelected ? 'text-red-200' : 'text-red-500'
            }`}
          />
          <div>
            <p
              className={`text-sm ${
                isSelected ? 'text-red-100' : 'text-gray-500'
              }`}
            >
              Duration
            </p>
            <p className="font-semibold">
              {Math.round(route.duration)} min
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <DollarSign
            className={`w-4 h-4 ${
              isSelected ? 'text-red-200' : 'text-red-500'
            }`}
          />
          <div>
            <p
              className={`text-sm ${
                isSelected ? 'text-red-100' : 'text-gray-500'
              }`}
            >
              Total Cost
            </p>
            <p className="font-semibold">
              ₹{route.cost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-opacity-20 border-current">
        <div className="flex items-center justify-between">
          <span
            className={`text-sm ${
              isSelected ? 'text-red-100' : 'text-gray-500'
            }`}
          >
            {typeof route.distance === 'number'
              ? route.distance.toFixed(2) + ' km'
              : route.distance} • {route.tolls.length} tolls
          </span>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-3 h-3 bg-white rounded-full"
            />
          )}
        </div>
      </div>

      {route.totalToll > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-red-800 text-lg font-bold text-green-700 dark:text-red-400 flex items-center">
          <IndianRupee className="w-5 h-5 mr-1 text-green-600 dark:text-white" />
          <span className="dark:text-white">₹{route.totalToll.toFixed(2)}</span>
        </div>
      )}
    </motion.div>
  );
};

export default RouteCard;
