const express = require('express');
const bcrypt = require("bcryptjs");
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Trop de tentatives, réessaie plus tard' }
});

// Validate username format
function validateUsername(username) {
  if (username.length < 2) throw new Error('Pseudo trop court (2+ caractères)');
  if (!/^[a-z0-9_\-]+$/i.test(username)) throw new Error('Pseudo : lettres/chiffres/_/- uniquement');
}

// POST /api/signup
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    }
    
    if (password.length < 3) {
      return res.status(400).json({ error: 'Mot de passe trop court' });
    }
    
    validateUsername(username.trim());
    
    const existingUser = await User.findOne({ username: username.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Ce pseudo existe déjà' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      username: username.trim().toLowerCase(),
      password: hashedPassword
    });
    
    await user.save();
    
    const token = generateToken(user.username);
    
    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      username: user.username
    });
  } catch (error) {
    if (error.message.includes('Pseudo') || error.message.includes('Mot de passe')) {
      return res.status(400).json({ error: error.message });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Pseudo et mot de passe requis' });
    }
    
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Compte introuvable' });
    }
    
    if (user.banned) {
      return res.status(403).json({ error: '🚫 Ce compte est banni' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    const token = generateToken(user.username);
    
    res.json({
      message: 'Connexion réussie',
      token,
      username: user.username,
      gameState: user.gameState
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
