import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = () => {
 
    localStorage.removeItem('token');
    localStorage.removeItem('name')
   window.location.reload(); 
    setIsLoggedIn(false);
    toast.success('Sign out successfull')
    navigate('/'); // redirect to login/signup page
  };

  return (
    <header className="bg-red-600 text-white"> {/* Updated background color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
        <Link to="/" className="flex items-center space-x-2 hover:text-red-100 transition-colors">
  <img src="/image.png" alt="Mahindra Logo" className="h-8 w-30" />
  <span className="text-xl font-semibold text-white">
    MahindraToll Calculator
  </span>
</Link>

  
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isLoggedIn && (
              <>
              <Link
              to="/profile"
              className="px-4 py-2 text-white hover:bg-red-700 rounded-lg transition-colors"
            >
              Profile
            </Link>
              <Link
                to="/calculator"
                className="px-4 py-2 text-white hover:bg-red-700 rounded-lg transition-colors">
                Calculator
              </Link>
              
            </>
            )}
  
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth"
                className="px-4 py-2 bg-white text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
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
