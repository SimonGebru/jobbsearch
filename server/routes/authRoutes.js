const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController");

// Registrera ny användare
router.post("/signup", signup);

// Logga in befintlig användare
router.post("/login", login);

module.exports = router;