const express = require('express');
const bcrypt = require("bcryptjs");
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Trop de tentatives, réessaie plus tard' }
});

router.post('/signup', authLimiter, async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.trim().toLowerCase();

    if (!username || !password)
      return res.status(400).json({ error: 'Pseudo et mot de passe requis' });

    if (password.length < 3)
      return res.status(400).json({ error: 'Mot de passe trop court' });

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ error: 'Ce pseudo existe déjà' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ username, password: hashed });

    const token = generateToken(username);

    res.status(201).json({ message: 'Compte créé', token, username });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username.trim().toLowerCase();

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Compte introuvable' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = generateToken(username);

    res.json({ message: 'Connexion réussie', token, username });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
