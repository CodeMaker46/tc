const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <img
              className="h-8 w-auto mb-4"
              src="/MahindraLogistics.png"
              alt="Mahindra"
            />
            <p className="text-gray-500 text-sm">
              Mahindra Toll Calculator helps you estimate toll costs and plan your journey across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="text-gray-500 text-sm">
                <span className="block">Support:</span>
                <a href="tel:1800-000-0000" className="hover:text-gray-900">
                  1800-000-0000
                </a>
              </li>
              <li className="text-gray-500 text-sm">
                <span className="block">Email:</span>
                <a href="mailto:support@mahindra.com" className="hover:text-gray-900">
                  support@mahindra.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Mahindra. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {/* X (Image) */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <img src="/image001.png" alt="LinkedIn" className="h-6 w-6" />
              </a>
              {/* LinkedIn (Image) */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <img src="/image002.png" alt="LinkedIn" className="h-6 w-6" />
              </a>

              {/* Instagram (Image) */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <img src="/image003.png" alt="Instagram" className="h-6 w-6" />
              </a>

              {/* YouTube (Image) */}
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">YouTube</span>
                <img src="/image004.png" alt="YouTube" className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer; 