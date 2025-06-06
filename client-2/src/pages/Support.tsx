import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, AlertTriangle, Plus, Send, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import { Query } from '../types';

const Support: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'dispute' | 'add_toll' | 'general'>('dispute');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    evidence: ''
  });
  const [queries, setQueries] = useState<Query[]>([
    {
      id: '1',
      type: 'dispute',
      title: 'Incorrect toll price for Lincoln Tunnel',
      description: 'The displayed price is $8.50 but I was charged $9.75',
      status: 'pending',
      createdAt: new Date('2024-01-15'),
      location: [40.7589, -73.9851]
    },
    {
      id: '2',
      type: 'add_toll',
      title: 'New toll booth on Route 287',
      description: 'There\'s a new toll booth that opened last month',
      status: 'resolved',
      createdAt: new Date('2024-01-10'),
      location: [40.9176, -74.1591]
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuery: Query = {
      id: Date.now().toString(),
      type: selectedType,
      title: formData.title,
      description: formData.description,
      status: 'pending',
      createdAt: new Date(),
      location: formData.location ? formData.location.split(',').map(Number) as [number, number] : undefined
    };
    setQueries([newQuery, ...queries]);
    setFormData({ title: '', description: '', location: '', evidence: '' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const queryTypes = [
    {
      id: 'dispute',
      title: 'Dispute Toll',
      description: 'Report incorrect toll prices or charges',
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'add_toll',
      title: 'Add New Toll',
      description: 'Suggest a new toll booth or update',
      icon: Plus,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'general',
      title: 'General Support',
      description: 'Other questions or feedback',
      icon: HelpCircle,
      color: 'from-gray-500 to-gray-600'
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
            Support Center
          </h1>
          <p className="text-gray-600 text-lg">
            Help us improve toll data accuracy and resolve any issues
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Query Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit a Query</h2>

            {/* Query Type Selection */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {queryTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id as any)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedType === type.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${type.color}`}>
                      <type.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Provide detailed information about the issue"
                />
              </div>

              {(selectedType === 'dispute' || selectedType === 'add_toll') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location {selectedType === 'add_toll' ? '(Required)' : '(Optional)'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-500" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required={selectedType === 'add_toll'}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Latitude, Longitude (e.g., 40.7128, -74.0060)"
                    />
                  </div>
                </div>
              )}

              {selectedType === 'dispute' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (Optional)</label>
                  <input
                    type="url"
                    value={formData.evidence}
                    onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="URL to receipt, photo, or other evidence"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
              >
                <Send className="w-4 h-4 inline mr-2" />
                Submit Query
              </motion.button>
            </form>
          </motion.div>

          {/* Query History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Queries</h2>

            <div className="space-y-4">
              {queries.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No queries submitted yet</p>
                </div>
              ) : (
                queries.map((query, index) => (
                  <motion.div
                    key={query.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{query.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{query.type.replace('_', ' ')}</p>
                      </div>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(query.status)}`}>
                        {getStatusIcon(query.status)}
                        <span className="capitalize">{query.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3">{query.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Submitted: {query.createdAt.toLocaleDateString()}</span>
                      {query.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{query.location[0].toFixed(4)}, {query.location[1].toFixed(4)}</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How long does it take to resolve disputes?</h3>
              <p className="text-gray-600 text-sm">Most toll disputes are reviewed within 2-3 business days. Complex cases may take up to a week.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">What evidence should I provide?</h3>
              <p className="text-gray-600 text-sm">Photos of toll receipts, screenshots of charges, or official documentation help speed up the review process.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">How do I suggest a new toll location?</h3>
              <p className="text-gray-600 text-sm">Use the "Add New Toll" option with accurate coordinates and any relevant details about the toll booth.</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Can I track the status of my query?</h3>
              <p className="text-gray-600 text-sm">Yes, all your submitted queries appear in the history section with real-time status updates.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Support;