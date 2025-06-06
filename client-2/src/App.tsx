import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Calculator from './pages/Calculator';
import TollData from './pages/TollData';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import API from './pages/API';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Calculator />} />
          <Route path="data" element={<TollData />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="api" element={<API />} />
          <Route path="support" element={<Support />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;