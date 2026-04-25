const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  banned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  // Game state
  gameState: {
    poop: { type: Number, default: 0 },
    totalPoop: { type: Number, default: 0 },
    pd: { type: Number, default: 0 },
    totalPdEarned: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    ap: { type: Number, default: 0 },
    totalApEarned: { type: Number, default: 0 },
    ascensionCount: { type: Number, default: 0 },
    mult: { type: Number, default: 1 },
    permMult: { type: Number, default: 1 },
    permClickMult: { type: Number, default: 1 },
    costMult: { type: Number, default: 1 },
    pdBonus: { type: Number, default: 0.02 },
    pdGainMult: { type: Number, default: 1 },
    critBonus: { type: Number, default: 0 },
    critMultBonus: { type: Number, default: 0 },
    perClickAdd: { type: Number, default: 0 },
    clickMult: { type: Number, default: 1 },
    clickSynergy: { type: Number, default: 0 },
    startBonus: { type: Number, default: 0 },
    autoClick: { type: Number, default: 0 },
    gemMine: { type: Number, default: 0 },
    lastGemMine: { type: Number, default: 0 }
  },
  // Arrays/objects
  toilets: { type: Map, of: Number, default: {} },
  upgrades: { type: Map, of: Boolean, default: {} },
  prestigeUpgrades: { type: Map, of: Boolean, default: {} },
  pets: { type: Map, of: Number, default: {} },
  mutations: { type: Map, of: Object, default: {} },
  premium: { type: Map, of: Boolean, default: {} },
  claimedQuests: { type: Map, of: Boolean, default: {} },
  ownedSkins: { type: Map, of: Boolean, default: { default: true } },
  skin: { type: String, default: 'default' }
}, {
  timestamps: true
});

// Index for leaderboard queries
userSchema.index({ totalPdEarned: -1 });
userSchema.index({ totalApEarned: -1 });

module.exports = mongoose.model('User', userSchema);
