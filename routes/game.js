const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Anti-cheat validation
function validateScore(state) {
  if (!state || typeof state !== 'object') return false;
  if (state.poop < 0 || state.totalPoop < 0) return false;
  if (state.pd < 0 || state.totalPdEarned < 0) return false;
  if (state.gems < 0 || state.ap < 0 || state.totalApEarned < 0) return false;
  if (state.mult < 0 || state.permMult < 0 || state.permClickMult < 0) return false;
  // Cap extremely high scores (anti-cheat)
  if (state.totalPdEarned > 1e30) return false;
  return true;
}

// POST /api/updateScore
router.post('/updateScore', authMiddleware, async (req, res) => {
  try {
    const { gameState, toilets, upgrades, prestigeUpgrades, pets, mutations, premium, claimedQuests, ownedSkins, skin } = req.body;
    
    if (!validateScore(gameState)) {
      return res.status(400).json({ error: 'Score invalide' });
    }
    
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    
    // Update game state
    user.gameState = { ...user.gameState, ...gameState };
    if (toilets) user.toilets = new Map(Object.entries(toilets));
    if (upgrades) user.upgrades = new Map(Object.entries(upgrades));
    if (prestigeUpgrades) user.prestigeUpgrades = new Map(Object.entries(prestigeUpgrades));
    if (pets) user.pets = new Map(Object.entries(pets));
    if (mutations) user.mutations = new Map(Object.entries(mutations));
    if (premium) user.premium = new Map(Object.entries(premium));
    if (claimedQuests) user.claimedQuests = new Map(Object.entries(claimedQuests));
    if (ownedSkins) user.ownedSkins = new Map(Object.entries(ownedSkins));
    if (skin) user.skin = skin;
    
    await user.save();
    
    res.json({ message: 'Score mis à jour' });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const type = req.query.type || 'pd'; // 'pd' or 'ap'
    const limit = parseInt(req.query.limit) || 10;
    
    let sortBy = type === 'ap' ? 'totalApEarned' : 'totalPdEarned';
    
    const users = await User.find({ banned: false })
      .select('username gameState.totalPdEarned gameState.totalApEarned')
      .sort({ [`gameState.${sortBy}`]: -1 })
      .limit(limit);
    
    const leaderboard = users.map(u => ({
      username: u.username,
      score: type === 'ap' ? (u.gameState?.totalApEarned || 0) : (u.gameState?.totalPdEarned || 0)
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/gameState
router.get('/gameState', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }
    
    res.json({
      gameState: user.gameState,
      toilets: Object.fromEntries(user.toilets),
      upgrades: Object.fromEntries(user.upgrades),
      prestigeUpgrades: Object.fromEntries(user.prestigeUpgrades),
      pets: Object.fromEntries(user.pets),
      mutations: Object.fromEntries(user.mutations),
      premium: Object.fromEntries(user.premium),
      claimedQuests: Object.fromEntries(user.claimedQuests),
      ownedSkins: Object.fromEntries(user.ownedSkins),
      skin: user.skin
    });
  } catch (error) {
    console.error('Get game state error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
