const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    trim: true, // tar bort onödiga mellanslag
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // valfritt: lite säkerhet
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // tillåter att vissa användare inte har e-post
    match: [/^\S+@\S+\.\S+$/, "Ogiltig e-postadress"],
    lowercase: true, // sparar alltid e-post i små bokstäver
    trim: true,
  },
});

// Hascha lösenordet innan det sparas
userSchema.pre("save", async function (next) {
  // Hasha bara om fältet ändrats OCH det inte redan ser ut som ett bcrypt-hash
  if (!this.isModified("password") || (typeof this.password === "string" && this.password.startsWith("$2"))) {
    return next();
  }
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err);
  }
});

// Jämför lösenord vid inloggning
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);