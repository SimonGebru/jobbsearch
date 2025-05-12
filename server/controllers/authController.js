const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

// Funktion för att skapa JWT-token
const createToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

// Registrera ny användare
const signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    const newUser = new User({ username, password });
    await newUser.save();

    const token = createToken(newUser); // ✅ Skicka hela användaren
    res.status(201).json({
      message: "Användare skapad",
      token: token,
    });
  } catch (error) {
    res.status(400).json({ error: "Användarnamnet är upptaget eller ogiltigt." });
  }
};

// Logga in befintlig användare
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Fel användarnamn eller lösenord." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Fel användarnamn eller lösenord." });
    }

    const token = createToken(user); // ✅ Skicka hela användaren
    res.status(200).json({ message: "Inloggning lyckades", token: token });
  } catch (error) {
    res.status(500).json({ error: "Något gick fel vid inloggning." });
  }
};

module.exports = { signup, login };