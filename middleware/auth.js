const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function ensureAdminExists() {
  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (!ADMIN_USER || !ADMIN_PASS) {
    console.log("⚠️ ADMIN_USER ou ADMIN_PASS manquant dans Render");
    return;
  }

  const existing = await User.findOne({ username: ADMIN_USER });

  if (!existing) {
    const hashed = await bcrypt.hash(ADMIN_PASS, 10);
    await User.create({
      username: ADMIN_USER,
      password: hashed,
      isAdmin: true
    });
    console.log("✔ Admin auto-créé :", ADMIN_USER);
  } else {
    console.log("✔ Admin déjà existant :", ADMIN_USER);
  }
}

module.exports = { ensureAdminExists };

