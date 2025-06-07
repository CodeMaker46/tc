import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import { useDarkMode } from '../context/DarkModeContext';
import { Moon, Sun } from 'lucide-react';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();


  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.clear(); // Clears all items from localStorage
    
    setIsLoggedIn(false);
    toast.success('Sign out successful');
    navigate('/auth'); // redirect to login/signup page
  };

  return (
    <header className="bg-red-600 text-white dark:bg-black dark:text-red-500"> {/* Updated background color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center space-x-2 hover:text-red-100">
  <img src="/image.png" alt="Mahindra Logo" className="h-8 w-30" />
  <span className="text-xl font-semibold text-white dark:text-white">
    MahindraToll Calculator
  </span>
</Link>

  
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isLoggedIn && (
              <>
              <button
                aria-label="Toggle dark mode"
                className="p-2 rounded-full border border-gray-200 dark:border-red-700 bg-white dark:bg-black shadow hover:bg-gray-100 dark:hover:bg-red-900"
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-red-500" />
                ) : (
                  <Moon className="w-5 h-5 text-red-500 dark:text-white" />
                )}
              </button>
              <Link
                to="/"
                className="px-4 py-2 text-white hover:bg-red-700 rounded-lg dark:text-white dark:hover:bg-red-900"
              >
                Home
              </Link>
              <Link
                to="/api"
                className="px-4 py-2 text-white hover:bg-red-700 rounded-lg dark:text-white dark:hover:bg-red-900"
              >
                API
              </Link>
              <Link
              to="/profile"
              className="px-4 py-2 text-white hover:bg-red-700 rounded-lg dark:text-white dark:hover:bg-red-900"
            >
              Profile
            </Link>
              <Link
                to="/calculator"
                className="px-4 py-2 text-white hover:bg-red-700 rounded-lg dark:text-white dark:hover:bg-red-900">
                Calculator
              </Link>
              
            </>
            )}
  
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg font-medium dark:bg-red-900 dark:text-white dark:hover:bg-red-800"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg font-medium dark:bg-red-900 dark:text-white dark:hover:bg-red-800"
              >
                Login / Signup
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
  
};

export default Header;
