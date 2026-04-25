const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/announcement - Get current announcement
router.get('/', async (req, res) => {
  try {
    // Pour l'instant, on peut utiliser une simple variable en mémoire
    // ou le stocker dans MongoDB. Pour simplifier, utilisons une variable globale
    // qui sera initialisée depuis un fichier ou la base de données
    const announcement = global.currentAnnouncement || null;
    res.json({ announcement });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/announcement - Set announcement (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (text === undefined || text === null) {
      return res.status(400).json({ error: 'Paramètre text manquant' });
    }
    
    global.currentAnnouncement = text ? {
      text,
      id: Date.now().toString()
    } : null;
    
    res.json({ 
      message: text ? 'Annonce publiée' : 'Annonce supprimée',
      announcement: global.currentAnnouncement
    });
  } catch (error) {
    console.error('Set announcement error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
