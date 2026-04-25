const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-long';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.username !== process.env.ADMIN_USER) {
    return res.status(403).json({ error: 'Accès refusé - admin uniquement' });
  }
  next();
};

const generateToken = (username) => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { authMiddleware, adminMiddleware, generateToken };
