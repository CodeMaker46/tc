import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Car, Truck, Bike } from 'lucide-react';

interface SearchFormProps {
  onSearch: (data: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    vehicleType: 'car',
  });

  const vehicleTypes = [
    { id: 'car', name: 'Car', icon: Car },
    { id: 'truck', name: 'Truck', icon: Truck },
    { id: 'motorcycle', name: 'Motorcycle', icon: Bike },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.from && formData.to) {
      onSearch(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8 mx-auto max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* From Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.from}
                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                placeholder="Enter departure city"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* To Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.to}
                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                placeholder="Enter destination city"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Vehicle Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {vehicleTypes.map((vehicle) => {
              const Icon = vehicle.icon;
              return (
                <motion.button
                  key={vehicle.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormData({ ...formData, vehicleType: vehicle.id })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.vehicleType === vehicle.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon className="h-8 w-8 mx-auto mb-2" />
                  <span className="block text-sm font-medium">{vehicle.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!formData.from || !formData.to}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Search className="h-5 w-5" />
          <span>Calculate Routes</span>
        </motion.button>
      </form>
    </motion.div>
  );
};

export default SearchForm;