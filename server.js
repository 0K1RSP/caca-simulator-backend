require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const adminRoutes = require('./routes/admin');
const eventRoutes = require('./routes/event');
const announcementRoutes = require('./routes/announcement');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://caca-simulator.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("CORS blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caca-simulator')
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/announcement', announcementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Start server - écoute sur toutes les interfaces (0.0.0.0) pour permettre l'accès depuis mobile/Netlify
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur http://0.0.0.0:${PORT}`);
  console.log(`📊 API disponible sur http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Accès local : http://localhost:${PORT}`);
  console.log(`📱 Accès réseau : http://TON_IP_LOCALE:${PORT}`);
});
