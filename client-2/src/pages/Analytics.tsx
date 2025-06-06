import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, MapPin, Clock, Users, Calendar, Filter, Download } from 'lucide-react';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('usage');

  const stats = [
    {
      title: 'Total Routes Calculated',
      value: '12,847',
      change: '+12.5%',
      trend: 'up',
      icon: MapPin,
      color: 'text-blue-500'
    },
    {
      title: 'Average Savings',
      value: '$23.45',
      change: '+8.2%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Time Saved (Hours)',
      value: '1,234',
      change: '+15.3%',
      trend: 'up',
      icon: Clock,
      color: 'text-orange-500'
    },
    {
      title: 'Active Users',
      value: '3,456',
      change: '-2.1%',
      trend: 'down',
      icon: Users,
      color: 'text-red-500'
    }
  ];

  const routeTypeData = [
    { type: 'Cheapest', count: 5420, percentage: 42.2, color: 'bg-green-500' },
    { type: 'Fastest', count: 4830, percentage: 37.6, color: 'bg-orange-500' },
    { type: 'Balanced', count: 2597, percentage: 20.2, color: 'bg-blue-500' }
  ];

  const popularTolls = [
    { name: 'Lincoln Tunnel', usage: 2847, revenue: '$24,199.50', trend: '+5.2%' },
    { name: 'George Washington Bridge', usage: 2156, revenue: '$34,496.00', trend: '+8.1%' },
    { name: 'Holland Tunnel', usage: 1923, revenue: '$15,864.75', trend: '+3.4%' },
    { name: 'Bay Bridge', usage: 1654, revenue: '$11,578.00', trend: '-1.2%' },
    { name: 'Golden Gate Bridge', usage: 1432, revenue: '$12,601.60', trend: '+2.8%' }
  ];

  const timeRanges = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const metrics = [
    { value: 'usage', label: 'Usage Analytics' },
    { value: 'revenue', label: 'Revenue Analytics' },
    { value: 'performance', label: 'Performance Metrics' },
    { value: 'user', label: 'User Behavior' }
  ];

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
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Comprehensive insights into toll usage and performance</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-red-500" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-red-500" />
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {metrics.map(metric => (
                    <option key={metric.value} value={metric.value}>{metric.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Route Type Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Route Type Distribution</h2>
            <div className="space-y-4">
              {routeTypeData.map((route, index) => (
                <motion.div
                  key={route.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${route.color}`}></div>
                    <span className="font-medium text-gray-700">{route.type}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{route.count.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{route.percentage}%</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              {routeTypeData.map((route) => (
                <div key={route.type} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{route.type}</span>
                    <span>{route.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${route.percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className={`h-2 rounded-full ${route.color}`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Popular Tolls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">Most Popular Tolls</h2>
            <div className="space-y-4">
              {popularTolls.map((toll, index) => (
                <motion.div
                  key={toll.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{toll.name}</h3>
                    <p className="text-sm text-gray-600">{toll.usage.toLocaleString()} uses</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{toll.revenue}</p>
                    <p className={`text-sm ${
                      toll.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {toll.trend}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Usage Trends</h2>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Last {timeRange}</span>
            </div>
          </div>
          
          <div className="h-64 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-gray-500">Interactive charts would be displayed here</p>
              <p className="text-sm text-gray-400">Integration with Chart.js or similar library</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;