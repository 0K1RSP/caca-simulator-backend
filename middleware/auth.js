const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Vérifie le token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token invalide' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // username + isAdmin
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Vérifie si admin
function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
  next();
}

// Création auto de l’admin
async function ensureAdminExists() {
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    console.log("⚠️ ADMIN_USER ou ADMIN_PASS manquant dans Render");
    return;
  }

  const existing = await User.findOne({ username: ADMIN_USER });

  if (!existing) {
    const hashed = await bcrypt.hash(ADMIN_PASS, 10);
    await User.create({
      username: ADMIN_USER,
      password: hashed,
      isAdmin: true
    });
    console.log("✔ Admin auto-créé :", ADMIN_USER);
  } else {
    console.log("✔ Admin déjà existant :", ADMIN_USER);
  }
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  ensureAdminExists
};
