const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // console.log('Auth Middleware: Request received.');
  // console.log('Auth Middleware: Received headers:', req.headers);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      // console.log('Auth Middleware: Token extracted.');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('Auth Middleware: Token verified. Decoded ID:', decoded.id);

      // Attach user from the token
      const user = await User.findById(decoded.id).select('-password');
      // console.log('Auth Middleware: User looked up.', user ? 'Found' : 'Not Found');

      if (!user) {
        // console.log('Auth Middleware: User not found.');
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      // console.log('Auth Middleware: User attached to request. Proceeding to next middleware/route.');
      next();
    } catch (error) {
      console.error('Auth Middleware: ERROR caught during token verification or user lookup:', error.message);
      console.error('Auth Middleware Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log('Auth Middleware: No token found in headers.');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect }; 