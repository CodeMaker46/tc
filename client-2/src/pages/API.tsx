import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Check, Key, Globe, Zap, Shield } from 'lucide-react';

const API: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/routes/calculate',
      description: 'Calculate toll routes between two points',
      example: `{
  "origin": "40.7128,-74.0060",
  "destination": "40.7589,-73.9851",
  "vehicle_type": "car",
  "route_preference": "balanced"
}`
    },
    {
      method: 'GET',
      path: '/api/tolls/{toll_id}',
      description: 'Get detailed information about a specific toll',
      example: `{
  "id": "toll_123",
  "name": "Lincoln Tunnel",
  "location": [40.7589, -73.9851],
  "rates": {
    "car": 8.50,
    "truck": 24.00,
    "motorcycle": 6.00
  }
}`
    },
    {
      method: 'POST',
      path: '/api/disputes',
      description: 'Submit a toll dispute or report incorrect information',
      example: `{
  "toll_id": "toll_123",
  "type": "incorrect_price",
  "description": "The toll price shown is outdated",
  "evidence_url": "https://example.com/receipt.jpg"
}`
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Real-time Data',
      description: 'Access up-to-date toll prices and route information'
    },
    {
      icon: Globe,
      title: 'Global Coverage',
      description: 'Comprehensive toll data across major highways and bridges'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime SLA'
    }
  ];

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
            Developer API
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Integrate toll calculation and route optimization into your applications with our powerful REST API
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* API Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['overview', 'endpoints', 'authentication'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                    selectedTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Getting Started</h3>
                  <p className="text-gray-600 mb-4">
                    The TollCalc Pro API provides programmatic access to our toll calculation engine. 
                    All API requests are made over HTTPS and responses are returned in JSON format.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Base URL</h4>
                    <code className="text-red-600 bg-white px-2 py-1 rounded border">
                      https://api.tollcalc.pro/v1
                    </code>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Rate Limits</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800">Free Tier</h5>
                      <p className="text-blue-600 text-sm">1,000 requests/month</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-800">Pro Tier</h5>
                      <p className="text-red-600 text-sm">100,000 requests/month</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedTab === 'endpoints' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            endpoint.method === 'GET' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-gray-800 font-mono">{endpoint.path}</code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {copiedEndpoint === endpoint.path ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-gray-600 mb-4">{endpoint.description}</p>
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-gray-300">
                          <code>{endpoint.example}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {selectedTab === 'authentication' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">API Authentication</h3>
                  <p className="text-gray-600 mb-4">
                    All API requests must include a valid API key in the Authorization header.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Key className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">API Key Required</h4>
                      <p className="text-yellow-700 text-sm">
                        You'll need to register for an account to receive your API key.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Example Request</h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300">
                      <code>{`curl -X POST https://api.tollcalc.pro/v1/routes/calculate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "40.7128,-74.0060",
    "destination": "40.7589,-73.9851",
    "vehicle_type": "car"
  }'`}</code>
                    </pre>
                  </div>
                </div>

                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Get Your API Key
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default API;