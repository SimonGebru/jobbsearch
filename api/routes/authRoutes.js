// api/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  updateEmail,
  getProfile,
  updateUsername,
} = require("../controllers/authController");

const {
  sendResetEmail,
  resetPassword,
} = require("../controllers/passwordController");

const requireAuth = require("../middleware/auth");


// --- Öppna endpoints --- //

// Registrera ny användare (username + password, ev. email)
router.post("/signup", signup);

// Logga in (accepterar email ELLER username + password)
router.post("/login", login);

// Skicka återställningsmejl (alias-stöd för båda vägar)
router.post("/send-reset", sendResetEmail);
router.post("/forgot-password", sendResetEmail); // alias

// Återställ lösenord via token
router.post("/reset-password/:token", resetPassword);

// Enkel hälsokoll (bra för felsökning)
router.get("/health", (req, res) => res.json({ ok: true }));

// --- Skyddade endpoints --- //

// Hämta profil (bearer token krävs)
router.get("/me", requireAuth, getProfile);
router.get("/profile", requireAuth, getProfile); // alias

// Uppdatera email/lösenord
router.patch("/profile", requireAuth, updateEmail);

// Uppdatera användarnamn
router.patch("/username", requireAuth, updateUsername);

module.exports = router;