const express = require("express");
const Note = require("../models/Note");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * GET note for a specific status
 * Hämtar användarens anteckning baserat på status (t.ex. "Pågående", "Skickad")
 */
router.get("/:status", auth, async (req, res) => {
  try {
    const { username } = req.user;
    // 🧩 Avkoda status så att "P%C3%A5g%C3%A5ende" blir "Pågående"
    const status = decodeURIComponent(req.params.status);

    const note = await Note.findOne({ username, status });
    res.json(note || { status, text: "" });
  } catch (err) {
    console.error("❌ GET /notes error:", err);
    res.status(500).json({ error: "Serverfel vid hämtning av anteckning" });
  }
});

/**
 * PATCH note for a specific status
 * Skapar eller uppdaterar en anteckning för den inloggade användaren
 */
router.patch("/:status", auth, async (req, res) => {
  try {
    const { username } = req.user;
    const status = decodeURIComponent(req.params.status);
    const { text } = req.body;

    if (typeof text !== "string") {
      return res.status(400).json({ error: "Text måste vara en sträng" });
    }

    const updated = await Note.findOneAndUpdate(
      { username, status },
      { text, username, status },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("❌ PATCH /notes error:", err);
    res.status(500).json({ error: "Serverfel vid uppdatering av anteckning" });
  }
});

module.exports = router;