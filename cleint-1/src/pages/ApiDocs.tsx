import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Key, Book, Zap, Shield, Globe, Copy, Check } from 'lucide-react';

const ApiDocs = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [copiedCode, setCopiedCode] = useState('');
  const [apiKey, setApiKey] = useState('tk_live_51H...');

  const sections = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'endpoints', label: 'Endpoints', icon: Globe },
    { id: 'examples', label: 'Examples', icon: Code },
    { id: 'rate-limits', label: 'Rate Limits', icon: Shield },
  ];

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const codeExamples = {
    curl: `curl -X POST "https://api.tollpro.com/v1/calculate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "origin": "New York, NY",
    "destination": "Boston, MA",
    "vehicle_type": "car"
  }'`,
    
    javascript: `const response = await fetch('https://api.tollpro.com/v1/calculate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    origin: 'New York, NY',
    destination: 'Boston, MA',
    vehicle_type: 'car'
  })
});

const data = await response.json();
console.log(data);`,

    python: `import requests

url = "https://api.tollpro.com/v1/calculate"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "origin": "New York, NY",
    "destination": "Boston, MA",
    "vehicle_type": "car"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">API Documentation</h1>
            <p className="text-white/80 text-lg">Integrate toll calculations into your applications</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg">
              {/* Overview Section */}
              {activeSection === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">TollPro API Overview</h2>
                  
                  <div className="prose max-w-none mb-8">
                    <p className="text-lg text-gray-600 mb-6">
                      The TollPro API allows developers to integrate intelligent toll calculation and route optimization 
                      directly into their applications. Get real-time toll costs, compare routes, and provide users with 
                      the most cost-effective travel options.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Response</h3>
                      <p className="text-gray-600">Average response time under 200ms</p>
                    </div>
                    
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
                      <p className="text-gray-600">Industry-standard encryption and authentication</p>
                    </div>
                    
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Coverage</h3>
                      <p className="text-gray-600">Toll data for major highways worldwide</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                      <li>Sign up for a free developer account</li>
                      <li>Generate your API key from the dashboard</li>
                      <li>Make your first API call using our examples</li>
                      <li>Integrate toll calculations into your app</li>
                    </ol>
                  </div>
                </motion.div>
              )}

              {/* Authentication Section */}
              {activeSection === 'authentication' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Authentication</h2>
                  
                  <div className="mb-8">
                    <p className="text-lg text-gray-600 mb-6">
                      TollPro API uses API keys for authentication. Include your API key in the Authorization header 
                      for all requests.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex">
                      <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Keep your API key secure</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Never expose your API key in client-side code or public repositories.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Your API Key</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono text-gray-800 bg-white px-3 py-2 rounded border">
                            {apiKey}
                          </code>
                          <button
                            onClick={() => handleCopyCode(apiKey, 'api-key')}
                            className="ml-4 p-2 text-gray-600 hover:text-gray-900"
                          >
                            {copiedCode === 'api-key' ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Authorization Header</h3>
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <button
                          onClick={() => handleCopyCode('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                        >
                          {copiedCode === 'auth-header' ? (
                            <Check className="h-5 w-5 text-green-400" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                        <code className="text-green-400 font-mono text-sm">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Endpoints Section */}
              {activeSection === 'endpoints' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">API Endpoints</h2>
                  
                  <div className="space-y-8">
                    {/* Calculate Route Endpoint */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          POST
                        </span>
                        <code className="text-lg font-mono text-gray-900">/v1/calculate</code>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Calculate toll costs and compare routes between two locations.
                      </p>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Request Body</h4>
                          <div className="bg-gray-50 rounded p-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2">Parameter</th>
                                  <th className="text-left py-2">Type</th>
                                  <th className="text-left py-2">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b">
                                  <td className="py-2 font-mono">origin</td>
                                  <td className="py-2">string</td>
                                  <td className="py-2">Starting location (city, state or coordinates)</td>
                                </tr>
                                <tr className="border-b">
                                  <td className="py-2 font-mono">destination</td>
                                  <td className="py-2">string</td>
                                  <td className="py-2">Destination location</td>
                                </tr>
                                <tr>
                                  <td className="py-2 font-mono">vehicle_type</td>
                                  <td className="py-2">string</td>
                                  <td className="py-2">Vehicle type: "car", "truck", "motorcycle"</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`{
  "routes": [
    {
      "id": "fastest",
      "name": "Fastest Route",
      "distance": 245,
      "duration": 180,
      "toll_cost": 28.50,
      "fuel_cost": 35.20,
      "total_cost": 63.70
    }
  ],
  "request_id": "req_123456789"
}`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Get Route Details Endpoint */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          GET
                        </span>
                        <code className="text-lg font-mono text-gray-900">/v1/routes/{'{route_id}'}</code>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Get detailed information about a specific route calculation.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Examples Section */}
              {activeSection === 'examples' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Code Examples</h2>
                  
                  <div className="space-y-8">
                    {Object.entries(codeExamples).map(([lang, code]) => (
                      <div key={lang} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 capitalize">{lang}</h3>
                          <button
                            onClick={() => handleCopyCode(code, lang)}
                            className="p-2 text-gray-600 hover:text-gray-900"
                          >
                            {copiedCode === lang ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <Copy className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        <div className="bg-gray-900 p-4">
                          <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                            {code}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Rate Limits Section */}
              {activeSection === 'rate-limits' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Rate Limits</h2>
                  
                  <div className="space-y-6">
                    <p className="text-lg text-gray-600">
                      To ensure fair usage and maintain service quality, the TollPro API implements rate limiting.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-blue-900 mb-4">Free Tier</h3>
                        <ul className="space-y-2 text-blue-800">
                          <li>• 1,000 requests per month</li>
                          <li>• 10 requests per minute</li>
                          <li>• Basic route calculations</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-purple-900 mb-4">Pro Tier</h3>
                        <ul className="space-y-2 text-purple-800">
                          <li>• 100,000 requests per month</li>
                          <li>• 100 requests per minute</li>
                          <li>• Advanced route optimization</li>
                          <li>• Real-time traffic data</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Rate Limit Headers</h4>
                      <p className="text-yellow-700 text-sm mb-3">
                        Each API response includes headers to help you track your usage:
                      </p>
                      <div className="bg-gray-900 rounded p-3">
                        <pre className="text-green-400 font-mono text-sm">
{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1609459200`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;