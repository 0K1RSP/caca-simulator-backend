const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ensureAdminExists } = require('./middleware/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// IMPORTANT : Render utilise un proxy → obligatoire pour éviter les erreurs rate-limit
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')); // si tu en as une

// Connexion MongoDB + création auto de l'admin
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✔ MongoDB connecté");
    await ensureAdminExists(); // ← CRÉATION AUTO DE L'ADMIN
  })
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// Lancement du serveur
app.listen(3000, () => console.log("✔ Backend lancé sur port 3000"));
