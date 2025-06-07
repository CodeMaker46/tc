import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, MapPin, Clock, DollarSign, Settings, History, Star, Plus } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const savedRoutes = [
    {
      id: 1,
      name: 'Home to Office',
      from: 'New York, NY',
      to: 'Newark, NJ',
      lastUsed: '2 days ago',
      totalSaved: 45.20,
      timesUsed: 12,
    },
    {
      id: 2,
      name: 'Weekend Getaway',
      from: 'New York, NY',
      to: 'Boston, MA',
      lastUsed: '1 week ago',
      totalSaved: 28.90,
      timesUsed: 3,
    },
    {
      id: 3,
      name: 'Business Trip',
      from: 'Newark, NJ',
      to: 'Philadelphia, PA',
      lastUsed: '3 days ago',
      totalSaved: 67.40,
      timesUsed: 8,
    },
  ];

  const recentTrips = [
    {
      id: 1,
      from: 'New York',
      to: 'Boston',
      date: '2024-01-15',
      cost: 52.40,
      savings: 11.30,
      route: 'Cheapest Route',
    },
    {
      id: 2,
      from: 'Newark',
      to: 'Philadelphia',
      date: '2024-01-12',
      cost: 38.20,
      savings: 8.50,
      route: 'Balanced Route',
    },
    {
      id: 3,
      from: 'New York',
      to: 'Washington DC',
      date: '2024-01-10',
      cost: 75.80,
      savings: 15.20,
      route: 'Cheapest Route',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'routes', label: 'Saved Routes', icon: MapPin },
    { id: 'history', label: 'Trip History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <div className="bg-highway-pattern bg-cover bg-center">
        <div className="bg-gradient-to-r from-primary-900/90 to-primary-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Profile Dashboard</h1>
              <p className="text-white/80 text-lg">Manage your routes and track your savings</p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">$141.50</h3>
            <p className="text-gray-600">Total Saved</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">23</h3>
            <p className="text-gray-600">Trips Calculated</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">3</h3>
            <p className="text-gray-600">Saved Routes</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
            <p className="text-gray-600">Avg Rating</p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-all ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentTrips.slice(0, 3).map((trip) => (
                        <div key={trip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">
                              {trip.from} → {trip.to}
                            </p>
                            <p className="text-sm text-gray-600">{trip.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${trip.cost}</p>
                            <p className="text-sm text-green-600">Saved ${trip.savings}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-primary-50 rounded-lg">
                        <p className="text-sm text-primary-600 font-medium">Most Used Route</p>
                        <p className="text-lg font-semibold text-gray-900">Home to Office</p>
                        <p className="text-sm text-gray-600">12 times used</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Biggest Savings</p>
                        <p className="text-lg font-semibold text-gray-900">$15.20</p>
                        <p className="text-sm text-gray-600">New York → Washington DC</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Saved Routes Tab */}
            {activeTab === 'routes' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Your Saved Routes</h3>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Add Route</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {savedRoutes.map((route) => (
                    <div key={route.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{route.name}</h4>
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                          {route.timesUsed} uses
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600">
                          <MapPin className="h-4 w-4 inline mr-2" />
                          {route.from} → {route.to}
                        </p>
                        <p className="text-sm text-gray-500">Last used: {route.lastUsed}</p>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-600">Total Saved</p>
                          <p className="text-xl font-bold text-green-600">${route.totalSaved}</p>
                        </div>
                        <button className="text-primary-600 hover:text-primary-700 font-medium">
                          Use Route
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Trip History Tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">Trip History</h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Savings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentTrips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {trip.from} → {trip.to}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trip.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${trip.cost}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ${trip.savings}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {trip.route}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Preferences</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Default Vehicle Type</p>
                          <p className="text-sm text-gray-600">Set your preferred vehicle for calculations</p>
                        </div>
                        <select className="border border-gray-300 rounded-lg px-3 py-2">
                          <option>Car</option>
                          <option>Truck</option>
                          <option>Motorcycle</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Email Notifications</p>
                          <p className="text-sm text-gray-600">Receive updates about new features</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h4>
                    <p className="text-sm text-red-700 mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      Clear All Data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;