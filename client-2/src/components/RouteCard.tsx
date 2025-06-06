import React from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, MapPin, Zap, TrendingDown, Target } from 'lucide-react';
import { Route } from '../types';

interface RouteCardProps {
  route: Route;
  isSelected?: boolean;
  onSelect: (route: Route) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onSelect }) => {
  const getRouteIcon = () => {
    switch (route.type) {
      case 'fastest': return <Zap className="w-5 h-5" />;
      case 'cheapest': return <TrendingDown className="w-5 h-5" />;
      case 'balanced': return <Target className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getRouteColor = () => {
    switch (route.type) {
      case 'fastest': return 'from-orange-500 to-red-500';
      case 'cheapest': return 'from-green-500 to-red-500';
      case 'balanced': return 'from-blue-500 to-red-500';
      default: return 'from-red-500 to-red-600';
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
          : 'bg-white hover:bg-red-50 shadow-lg hover:shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isSelected 
              ? 'bg-white/20' 
              : `bg-gradient-to-r ${getRouteColor()}`
          }`}>
            <div className={isSelected ? 'text-white' : 'text-white'}>
              {getRouteIcon()}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">{route.name}</h3>
            <p className={`text-sm ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
              {route.type.charAt(0).toUpperCase() + route.type.slice(1)} Route
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Clock className={`w-4 h-4 ${isSelected ? 'text-red-200' : 'text-red-500'}`} />
          <div>
            <p className={`text-sm ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>Duration</p>
            <p className="font-semibold">{Math.round(route.duration)} min</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <DollarSign className={`w-4 h-4 ${isSelected ? 'text-red-200' : 'text-red-500'}`} />
          <div>
            <p className={`text-sm ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>Total Cost</p>
            <p className="font-semibold">${route.cost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-opacity-20 border-current">
        <div className="flex items-center justify-between">
          <span className={`text-sm ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
            {route.distance.toFixed(1)} miles • {route.tolls.length} tolls
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
    </motion.div>
  );
};

export default RouteCard;