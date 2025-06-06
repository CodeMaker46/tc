import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, Filter, MapPin, DollarSign, Clock, Truck, Car, Bike, Eye, Edit, Trash2 } from 'lucide-react';

interface TollData {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  state: string;
  highway: string;
  carRate: number;
  truckRate: number;
  motorcycleRate: number;
  operatingHours: string;
  paymentMethods: string[];
  lastUpdated: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const TollData: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<'car' | 'truck' | 'motorcycle'>('car');
  const [sortBy, setSortBy] = useState<'name' | 'rate' | 'location'>('name');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Mock toll data
  const tollData: TollData[] = [
    {
      id: '1',
      name: 'Lincoln Tunnel',
      location: 'New York, NY',
      coordinates: [40.7589, -73.9851],
      state: 'NY',
      highway: 'Route 495',
      carRate: 8.50,
      truckRate: 24.00,
      motorcycleRate: 6.00,
      operatingHours: '24/7',
      paymentMethods: ['E-ZPass', 'Cash', 'Credit Card'],
      lastUpdated: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'George Washington Bridge',
      location: 'New York, NY',
      coordinates: [40.8176, -73.9442],
      state: 'NY',
      highway: 'I-95',
      carRate: 16.00,
      truckRate: 68.00,
      motorcycleRate: 12.00,
      operatingHours: '24/7',
      paymentMethods: ['E-ZPass', 'Cash'],
      lastUpdated: '2024-01-14',
      status: 'active'
    },
    {
      id: '3',
      name: 'Holland Tunnel',
      location: 'New York, NY',
      coordinates: [40.7280, -74.0134],
      state: 'NY',
      highway: 'Route 78',
      carRate: 8.25,
      truckRate: 23.50,
      motorcycleRate: 5.75,
      operatingHours: '24/7',
      paymentMethods: ['E-ZPass', 'Cash', 'Credit Card'],
      lastUpdated: '2024-01-13',
      status: 'active'
    },
    {
      id: '4',
      name: 'Bay Bridge',
      location: 'San Francisco, CA',
      coordinates: [37.7983, -122.3778],
      state: 'CA',
      highway: 'I-80',
      carRate: 7.00,
      truckRate: 21.00,
      motorcycleRate: 3.50,
      operatingHours: '24/7',
      paymentMethods: ['FasTrak', 'License Plate'],
      lastUpdated: '2024-01-12',
      status: 'active'
    },
    {
      id: '5',
      name: 'Golden Gate Bridge',
      location: 'San Francisco, CA',
      coordinates: [37.8199, -122.4783],
      state: 'CA',
      highway: 'US-101',
      carRate: 8.80,
      truckRate: 26.40,
      motorcycleRate: 6.60,
      operatingHours: '24/7',
      paymentMethods: ['FasTrak', 'License Plate'],
      lastUpdated: '2024-01-11',
      status: 'active'
    },
    {
      id: '6',
      name: 'Chesapeake Bay Bridge',
      location: 'Maryland, MD',
      coordinates: [38.9987, -76.3336],
      state: 'MD',
      highway: 'US-50',
      carRate: 4.00,
      truckRate: 12.00,
      motorcycleRate: 2.50,
      operatingHours: '24/7',
      paymentMethods: ['E-ZPass', 'Cash'],
      lastUpdated: '2024-01-10',
      status: 'maintenance'
    }
  ];

  const states = ['all', ...Array.from(new Set(tollData.map(toll => toll.state)))];

  const filteredData = useMemo(() => {
    return tollData
      .filter(toll => {
        const matchesSearch = toll.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            toll.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            toll.highway.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = selectedState === 'all' || toll.state === selectedState;
        return matchesSearch && matchesState;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rate':
            const rateA = selectedVehicle === 'car' ? a.carRate : selectedVehicle === 'truck' ? a.truckRate : a.motorcycleRate;
            const rateB = selectedVehicle === 'car' ? b.carRate : selectedVehicle === 'truck' ? b.truckRate : b.motorcycleRate;
            return rateA - rateB;
          case 'location':
            return a.location.localeCompare(b.location);
          default:
            return 0;
        }
      });
  }, [searchTerm, selectedState, selectedVehicle, sortBy]);

  const exportToCSV = () => {
    const headers = ['Name', 'Location', 'State', 'Highway', 'Car Rate', 'Truck Rate', 'Motorcycle Rate', 'Operating Hours', 'Payment Methods', 'Status', 'Last Updated'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(toll => [
        toll.name,
        toll.location,
        toll.state,
        toll.highway,
        toll.carRate,
        toll.truckRate,
        toll.motorcycleRate,
        toll.operatingHours,
        toll.paymentMethods.join(';'),
        toll.status,
        toll.lastUpdated
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toll_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle) {
      case 'car': return <Car className="w-4 h-4" />;
      case 'truck': return <Truck className="w-4 h-4" />;
      case 'motorcycle': return <Bike className="w-4 h-4" />;
      default: return <Car className="w-4 h-4" />;
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
            Toll Data Center
          </h1>
          <p className="text-gray-600 text-lg">Comprehensive toll information and pricing data</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="Search tolls, locations, highways..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {states.map(state => (
                <option key={state} value={state}>
                  {state === 'all' ? 'All States' : state}
                </option>
              ))}
            </select>

            {/* Vehicle Type */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['car', 'truck', 'motorcycle'] as const).map((vehicle) => (
                <button
                  key={vehicle}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-md transition-all ${
                    selectedVehicle === vehicle
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  {getVehicleIcon(vehicle)}
                  <span className="text-sm font-medium capitalize">{vehicle}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="name">Sort by Name</option>
              <option value="rate">Sort by Rate</option>
              <option value="location">Sort by Location</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {filteredData.length} of {tollData.length} tolls
              </span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === 'cards' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToCSV}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Data Display */}
        {viewMode === 'table' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-red-800">Toll Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-red-800">Location</th>
                    <th className="text-left py-4 px-6 font-semibold text-red-800">Highway</th>
                    <th className="text-left py-4 px-6 font-semibold text-red-800">
                      {selectedVehicle.charAt(0).toUpperCase() + selectedVehicle.slice(1)} Rate
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-red-800">Status</th>
                    <th className="text-left py-4 px-6 font-semibold text-red-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((toll, index) => (
                    <motion.tr
                      key={toll.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-b border-gray-100 hover:bg-red-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="font-medium text-gray-800">{toll.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{toll.location}</td>
                      <td className="py-4 px-6 text-gray-600">{toll.highway}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-green-600">
                          ${selectedVehicle === 'car' ? toll.carRate : selectedVehicle === 'truck' ? toll.truckRate : toll.motorcycleRate}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(toll.status)}`}>
                          {toll.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-blue-500 hover:text-blue-700">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-500 hover:text-gray-700">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((toll, index) => (
              <motion.div
                key={toll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{toll.name}</h3>
                    <p className="text-sm text-gray-600">{toll.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(toll.status)}`}>
                    {toll.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Highway:</span>
                    <span className="font-medium">{toll.highway}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <Car className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                      <p className="text-xs text-gray-600">Car</p>
                      <p className="font-semibold text-blue-600">${toll.carRate}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2">
                      <Truck className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                      <p className="text-xs text-gray-600">Truck</p>
                      <p className="font-semibold text-orange-600">${toll.truckRate}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <Bike className="w-4 h-4 mx-auto text-green-500 mb-1" />
                      <p className="text-xs text-gray-600">Bike</p>
                      <p className="font-semibold text-green-600">${toll.motorcycleRate}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hours:</span>
                    <span className="font-medium">{toll.operatingHours}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Updated: {toll.lastUpdated}</span>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-blue-500 hover:text-blue-700">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TollData;