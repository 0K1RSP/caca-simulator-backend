const express = require('express');
const Event = require('../models/Event');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/event - Get active events
router.get('/', async (req, res) => {
  try {
    let eventDoc = await Event.findOne({ eventId: 'current' });
    if (!eventDoc) {
      eventDoc = new Event({ eventId: 'current' });
      await eventDoc.save();
    }
    res.json({ activeEvents: Object.fromEntries(eventDoc.activeEvents) });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/event - Toggle an event (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { eventId, active } = req.body;
    
    if (!eventId || typeof active !== 'boolean') {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }
    
    let eventDoc = await Event.findOne({ eventId: 'current' });
    if (!eventDoc) {
      eventDoc = new Event({ eventId: 'current' });
    }
    
    if (active) {
      eventDoc.activeEvents.set(eventId, { active: true, since: Date.now() });
    } else {
      eventDoc.activeEvents.delete(eventId);
    }
    
    eventDoc.updatedAt = Date.now();
    await eventDoc.save();
    
    res.json({ 
      message: active ? `Événement ${eventId} activé` : `Événement ${eventId} désactivé`,
      activeEvents: Object.fromEntries(eventDoc.activeEvents)
    });
  } catch (error) {
    console.error('Toggle event error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/event/clear - Clear all events (admin only)
router.post('/clear', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let eventDoc = await Event.findOne({ eventId: 'current' });
    if (!eventDoc) {
      eventDoc = new Event({ eventId: 'current' });
    }
    
    eventDoc.activeEvents.clear();
    eventDoc.updatedAt = Date.now();
    await eventDoc.save();
    
    res.json({ message: 'Tous les événements désactivés', activeEvents: {} });
  } catch (error) {
    console.error('Clear events error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
