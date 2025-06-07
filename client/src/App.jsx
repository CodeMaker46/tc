import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import ForgetPassword from './components/ForgetPassword';
import AdminLogin from './components/Admin';
import ResetPassword from './components/ResetPassword';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import TollData from './pages/TollData';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DarkModeProvider } from './context/DarkModeContext';
import API from './pages/Api';

function App() {
  return (
    <Router>
      <ToastContainer />
      <DarkModeProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* API Route with Layout */}
          <Route
            path="/api"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
                <Header />
                <div className="flex-grow">
                  <API />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Home Route - Separate for instant loading */}
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
                <Header />
                <div className="flex-grow">
                  <Home />
                </div>
                <Footer />
              </div>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/calculator"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
                <Header />
                <div className="flex-grow">
                  <PrivateRoute>
                    <Calculator />
                  </PrivateRoute>
                </div>
                <Footer />
              </div>
            }
          />
          <Route
            path="/profile"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
                <Header />
                <div className="flex-grow">
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                </div>
                <Footer />
              </div>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/toll-data"
            element={
              <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
                <Header />
                <div className="flex-grow">
                  <AdminRoute>
                    <TollData />
                  </AdminRoute>
                </div>
                <Footer />
              </div>
            }
          />
        </Routes>
      </DarkModeProvider>
    </Router>
  );
}

export default App;
