const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-min-32-chars-long';

// Création auto de l’admin si absent
async function ensureAdminExists() {
  const adminUser = process.env.ADMIN_USER?.toLowerCase();
  const adminPass = process.env.ADMIN_PASS;

  if (!adminUser || !adminPass) return;

  const existing = await User.findOne({ username: adminUser });
  if (!existing) {
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(adminPass, 10);

    await User.create({
      username: adminUser,
      password: hashed,
      banned: false
    });

    console.log("✔ Admin auto-créé :", adminUser);
  }
}

// Middleware auth
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Middleware admin
const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès refusé - admin uniquement' });
  }
  next();
};

// Token avec flag admin
const generateToken = (username) => {
  const isAdmin = username === process.env.ADMIN_USER?.toLowerCase();
  return jwt.sign({ username, isAdmin }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { authMiddleware, adminMiddleware, generateToken, ensureAdminExists };
