import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, MapPin, Clock, DollarSign, Save, Camera, Bell } from 'lucide-react';
import { User as UserType, Route } from '../types';

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserType>({
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    savedRoutes: [
      {
        id: '1',
        name: 'Home to Work',
        distance: 23.5,
        duration: 28,
        cost: 8.50,
        type: 'balanced',
        coordinates: [[40.7128, -74.0060], [40.7589, -73.9851]],
        tolls: []
      },
      {
        id: '2',
        name: 'Weekend Trip',
        distance: 156.3,
        duration: 145,
        cost: 24.75,
        type: 'cheapest',
        coordinates: [[40.7128, -74.0060], [41.2033, -77.1945]],
        tolls: []
      }
    ],
    preferences: {
      vehicleType: 'car',
      preferredRouteType: 'balanced'
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    routeUpdates: true,
    tollChanges: false,
    newFeatures: true
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save user data
  };

  const stats = [
    { label: 'Routes Calculated', value: '247', icon: MapPin, color: 'text-red-500' },
    { label: 'Hours Saved', value: '32.5', icon: Clock, color: 'text-blue-500' },
    { label: 'Money Saved', value: '$156', icon: DollarSign, color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
            Your Profile
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-red-100"
                  />
                  <button className="absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                  <select
                    value={user.preferences.vehicleType}
                    onChange={(e) => setUser({
                      ...user,
                      preferences: {...user.preferences, vehicleType: e.target.value as any}
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                  >
                    <option value="car">Car</option>
                    <option value="truck">Truck</option>
                    <option value="motorcycle">Motorcycle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Route</label>
                  <select
                    value={user.preferences.preferredRouteType}
                    onChange={(e) => setUser({
                      ...user,
                      preferences: {...user.preferences, preferredRouteType: e.target.value as any}
                    })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                  >
                    <option value="fastest">Fastest</option>
                    <option value="cheapest">Cheapest</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  {isEditing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                      >
                        <Save className="w-4 h-4 inline mr-2" />
                        Save Changes
                      </motion.button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      <Settings className="w-4 h-4 inline mr-2" />
                      Edit Profile
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Notifications</h3>
              </div>
              
              <div className="space-y-3">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Stats and Saved Routes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Saved Routes */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Saved Routes</h3>
              <div className="space-y-4">
                {user.savedRoutes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ x: 4 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">{route.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span>{route.distance} mi</span>
                          <span>{route.duration} min</span>
                          <span>${route.cost}</span>
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded-full text-xs">
                            {route.type}
                          </span>
                        </div>
                      </div>
                      <button className="text-red-500 hover:text-red-700 font-medium">
                        Use Route
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;