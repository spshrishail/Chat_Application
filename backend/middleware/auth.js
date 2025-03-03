const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    // 🛑 Check if authorization header is missing
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    // 🔍 Extract token (Ensure correct Bearer token format)
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = tokenParts[1];

    // 🎟️ Verify Token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err.message);

        // Specific error messages
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token expired. Please log in again.' });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ message: 'Invalid token' });
        } else {
          return res.status(403).json({ message: 'Token verification failed' });
        }
      }

      // ✅ Attach decoded user to request
      req.user = decoded;
      next();
    });

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { authenticateToken };
