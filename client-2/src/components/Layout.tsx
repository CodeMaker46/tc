import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './Navigation';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100">
      <div 
        className="absolute inset-0 opacity-5 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/2885320/pexels-photo-2885320.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"
        }}
      />
      <div className="relative z-10">
        <Navigation />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;