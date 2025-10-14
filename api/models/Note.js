const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  username: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Skickad", "Pågående", "Intervju", "Avslutat", "Nej tack"],
  },
  text: { type: String, default: "" },
});

module.exports = mongoose.model("Note", noteSchema);