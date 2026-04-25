const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    default: 'current'
  },
  activeEvents: {
    type: Map,
    of: {
      active: { type: Boolean, default: true },
      since: { type: Date, default: Date.now }
    },
    default: {}
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', eventSchema);
