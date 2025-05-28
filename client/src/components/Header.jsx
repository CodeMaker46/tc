import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Name */}
          <Link to="/" className="flex items-center hover:text-blue-100 transition-colors">
            <span className="text-xl font-semibold text-white">
              Mahindra Toll Calculator
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <a 
              href="/calculator" 
              className="px-4 py-2 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Calculator
            </a>
            <a 
              href="/auth" 
              className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              Login / Signup
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 