const express = require("express");
const router = express.Router();
const {
    signup,
    login,
    updateEmail,
    getProfile,
    updateUsername, // 👈 lägg till detta!
  } = require("../controllers/authController");
const {
  sendResetEmail,
  resetPassword,
} = require("../controllers/passwordController");
const requireAuth = require("../middleware/auth"); // 👈 se till att du importerar den

// Registrera ny användare
router.post("/signup", signup);

// Logga in befintlig användare
router.post("/login", login);

// Skicka återställningsmejl
router.post("/forgot-password", sendResetEmail);

// Återställ lösenord via token
router.post("/reset-password/:token", resetPassword);

// 🔐 PROFIL
router.get("/profile", requireAuth, getProfile); // 👈 lägg till denna
router.patch("/profile", requireAuth, updateEmail); // 👈 lägg till denna
router.patch("/username", requireAuth, updateUsername);
module.exports = router;