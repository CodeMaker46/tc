import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, Route, Star, TrendingDown, Zap } from 'lucide-react';

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

interface RouteCardProps {
  route: RouteData;
}

const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  const getCardStyles = () => {
    switch (route.type) {
      case 'cheapest':
        return {
          border: 'border-green-200',
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          icon: DollarSign,
          iconBg: 'bg-green-500',
          badge: 'bg-green-500',
          accentColor: 'text-green-600',
        };
      case 'fastest':
        return {
          border: 'border-blue-200',
          bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
          icon: Zap,
          iconBg: 'bg-blue-500',
          badge: 'bg-blue-500',
          accentColor: 'text-blue-600',
        };
      case 'balanced':
        return {
          border: 'border-purple-200',
          bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
          icon: Star,
          iconBg: 'bg-purple-500',
          badge: 'bg-purple-500',
          accentColor: 'text-purple-600',
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-white',
          icon: Route,
          iconBg: 'bg-gray-500',
          badge: 'bg-gray-500',
          accentColor: 'text-gray-600',
        };
    }
  };

  const styles = getCardStyles();
  const Icon = styles.icon;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-gradient-to-br from-transparent via-white to-transparent"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center space-x-3">
          <div className={`${styles.iconBg} p-2 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{route.name}</h3>
        </div>
        
        {route.type === 'cheapest' && (
          <div className={`${styles.badge} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            Best Value
          </div>
        )}
        
        {route.type === 'fastest' && (
          <div className={`${styles.badge} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            Fastest
          </div>
        )}
        
        {route.type === 'balanced' && (
          <div className={`${styles.badge} text-white px-3 py-1 rounded-full text-sm font-medium`}>
            Recommended
          </div>
        )}
      </div>

      {/* Savings Badge */}
      {route.savings && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
        >
          <TrendingDown className="h-3 w-3" />
          <span>Save ${route.savings.toFixed(2)}</span>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Duration</span>
          </div>
          <p className={`text-2xl font-bold ${styles.accentColor}`}>
            {formatDuration(route.duration)}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <Route className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Distance</span>
          </div>
          <p className={`text-2xl font-bold ${styles.accentColor}`}>
            {route.distance} mi
          </p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3 mb-6 relative">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Toll Costs</span>
          <span className="font-semibold">${route.tollCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Fuel Costs</span>
          <span className="font-semibold">${route.fuelCost.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Cost</span>
            <span className={`text-2xl font-bold ${styles.accentColor}`}>
              ${route.totalCost.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-full ${styles.iconBg} text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all`}
      >
        Select This Route
      </motion.button>
    </motion.div>
  );
};

export default RouteCard;