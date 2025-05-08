const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },company: { type: String, required: true },
  role: { type: String },
  location: { type: String },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  appliedDate: { type: Date },
  status: {
    type: String,
    enum: ["Skickad", "Pågående", "Intervju", "Avslutat", "Nej tack"],
    default: "Skickad"
  },
  notes: { type: String },
  source: { type: String }
});

module.exports = mongoose.model("Application", applicationSchema);