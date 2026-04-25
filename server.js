const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { ensureAdminExists } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin')); // si tu en as une

// Connexion + création auto admin
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✔ MongoDB connecté");
    await ensureAdminExists();
  })
  .catch(err => console.error(err));

app.listen(3000, () => console.log("✔ Backend lancé sur port 3000"));
