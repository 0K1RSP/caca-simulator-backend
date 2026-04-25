const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users - List all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('username banned createdAt lastLogin gameState');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/ban - Ban/unban a user
router.post('/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, banned } = req.body;
    
    if (!username || typeof banned !== 'boolean') {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }
    
    if (username === process.env.ADMIN_USER) {
      return res.status(403).json({ error: 'Impossible de bannir l\'admin' });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    
    user.banned = banned;
    await user.save();
    
    res.json({ message: banned ? `Utilisateur ${username} banni` : `Utilisateur ${username} débanni` });
  } catch (error) {
    console.error('Ban error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/giveItem - Give an item to a user
router.post('/giveItem', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, action, amount, itemType, itemId } = req.body;
    
    if (!username || !action) {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    
    // Apply action based on type
    switch (action) {
      case 'givePoop':
        user.gameState.poop = (user.gameState.poop || 0) + (parseFloat(amount) || 0);
        break;
      case 'setPoop':
        user.gameState.poop = parseFloat(amount) || 0;
        break;
      case 'multPoop':
        user.gameState.poop = (user.gameState.poop || 0) * (parseFloat(amount) || 10);
        break;
      case 'givePD':
        user.gameState.pd = (user.gameState.pd || 0) + (parseFloat(amount) || 0);
        break;
      case 'setPD':
        user.gameState.pd = parseFloat(amount) || 0;
        break;
      case 'multPD':
        user.gameState.pd = (user.gameState.pd || 0) * (parseFloat(amount) || 10);
        break;
      case 'giveGems':
        user.gameState.gems = (user.gameState.gems || 0) + (parseFloat(amount) || 0);
        break;
      case 'setGems':
        user.gameState.gems = parseFloat(amount) || 0;
        break;
      case 'multGems':
        user.gameState.gems = (user.gameState.gems || 0) * (parseFloat(amount) || 10);
        break;
      case 'giveAP':
        user.gameState.ap = (user.gameState.ap || 0) + (parseFloat(amount) || 0);
        user.gameState.totalApEarned = (user.gameState.totalApEarned || 0) + (parseFloat(amount) || 0);
        break;
      case 'setAP':
        user.gameState.ap = parseFloat(amount) || 0;
        break;
      case 'multAP':
        user.gameState.ap = (user.gameState.ap || 0) * (parseFloat(amount) || 10);
        user.gameState.totalApEarned = (user.gameState.totalApEarned || 0) * (parseFloat(amount) || 10);
        break;
      case 'givePet':
        if (!itemId) return res.status(400).json({ error: 'Pet ID requis' });
        user.pets.set(itemId, (user.pets.get(itemId) || 0) + (parseInt(amount) || 1));
        break;
      case 'giveAllPets':
        // This would need the PETS array from game.js, simplified for now
        return res.status(400).json({ error: 'Action non implémentée' });
      case 'clearPets':
        user.pets.clear();
        user.mutations.clear();
        break;
      default:
        return res.status(400).json({ error: 'Action inconnue' });
    }
    
    await user.save();
    res.json({ message: `Action ${action} appliquée à ${username}` });
  } catch (error) {
    console.error('Give item error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/changePassword
router.post('/changePassword', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    
    if (!username || !newPassword || newPassword.length < 3) {
      return res.status(400).json({ error: 'Mot de passe trop court' });
    }
    
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    
    res.json({ message: 'Mot de passe modifié' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
