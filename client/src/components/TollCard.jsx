import React from 'react';
import { MapPin, Edit, Trash2, Car, Truck, Bus } from 'lucide-react';

const TollCard = ({ toll, onEdit, onDelete }) => {
  // Function to truncate text with ellipsis
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
              {truncateText(toll.name, 25)}
            </h3>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="font-mono truncate">{toll.plaza_code}</span>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(toll)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Edit toll"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(toll)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete toll"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</div>
          <div className="text-xs font-mono text-gray-500 dark:text-gray-500 truncate">
            {toll.lat.toFixed(4)}, {toll.lng.toFixed(4)}
          </div>
        </div>

        {/* Rates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Car className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Car</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{toll.tolls.car}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Truck className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>LCV</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{toll.tolls.lcv}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Bus className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Bus</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              ₹{toll.tolls.bus}
            </span>
          </div>
        </div>

        {/* Additional Rates (Collapsible) */}
        <details className="mt-4">
          <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            More rates...
          </summary>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Three Axle:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{toll.tolls.threeAxle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Four Axle:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{toll.tolls.fourAxle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">HCM EME:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{toll.tolls.hcmEme}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Oversized:</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{toll.tolls.oversized}</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default TollCard;