import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Calculator from './pages/Calculator';
import Profile from './pages/Profile';
import ApiDocs from './pages/ApiDocs';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Calculator />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/api" element={<ApiDocs />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;