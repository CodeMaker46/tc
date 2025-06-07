import React from 'react';

const FilterPanel = ({ filters, onFiltersChange }) => {
  const handleChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
        Filter by Car Rate
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Minimum Rate (₹)
          </label>
          <input
            type="number"
            value={filters.minCarRate}
            onChange={(e) => handleChange('minCarRate', e.target.value)}
            placeholder="Min rate..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
            Maximum Rate (₹)
          </label>
          <input
            type="number"
            value={filters.maxCarRate}
            onChange={(e) => handleChange('maxCarRate', e.target.value)}
            placeholder="Max rate..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 