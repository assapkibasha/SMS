const jwt = require('jsonwebtoken');

const authMiddleware = (roles) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader || null;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = decoded;

      if (roles && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      next();
    });
  };
};

module.exports = authMiddleware;