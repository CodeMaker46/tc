import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator, User, Code, HelpCircle, Menu, X, MapPin, Database, BarChart3, Settings } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Calculator', icon: Calculator },
    { path: '/data', label: 'Toll Data', icon: Database },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/api', label: 'API', icon: Code },
    { path: '/support', label: 'Support', icon: HelpCircle },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-red-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg"
            >
              <MapPin className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              TollCalc Pro
            </span>
          </Link>

          {/* Desktop Navigation - Moved to Left */}
          <div className="hidden md:flex space-x-1 flex-1 ml-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Settings Button */}
          <div className="hidden md:flex">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-red-100"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;