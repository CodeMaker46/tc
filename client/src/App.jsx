import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Calculator from './pages/Calculator';
import ForgetPassword from './components/ForgetPassword';
import ResetPassword from './components/ResetPassword';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <ToastContainer />

      <Routes>
        {/* Public Route */}
        <Route path="/auth" element={<Auth />} />

        {/* Layout Route */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <div className="flex-grow">
                <Routes>
                  {/* Home is public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/forget-password" element={<ForgetPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* Protected Routes */}
                  <Route
                    path="/calculator"
                    element={
                      <PrivateRoute>
                        <Calculator />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
