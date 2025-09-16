const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Skapa JWT
const createToken = (user) =>
  jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

/** POST /api/auth/signup  Body: { username, password, [email] } */
const signup = async (req, res) => {
  try {
    const username = typeof req.body.username === "string" ? req.body.username.trim() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const email    = typeof req.body.email === "string"    ? req.body.email.trim()    : "";

    if (!username || !password) {
      return res.status(400).json({ error: "Username och password krävs." });
    }

    const exists = await User.findOne(email ? { $or: [{ username }, { email }] } : { username });
    if (exists) return res.status(400).json({ error: "Användarnamnet eller e-posten är redan upptagen." });

    // >>> HÄR: blocket med passToStore (se ovan) <<<
    const normUsername = username;
    const normEmail    = email;
    const normPassword = typeof password === "string" ? password : "";
    const saltRounds   = 10;
    const passToStore  = normPassword.startsWith("$2")
      ? normPassword
      : await bcrypt.hash(normPassword, saltRounds);

    const newUser = new User({
      username: normUsername,
      password: passToStore,
      ...(normEmail ? { email: normEmail } : {}),
    });
    await newUser.save();

    const token = createToken(newUser);
    return res.status(201).json({
      message: "Användare skapad",
      token,
      user: { _id: newUser._id, username: newUser.username, email: newUser.email },
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    return res.status(500).json({ error: "Serverfel vid registrering." });
  }
};

/** POST /api/auth/login  Body: { username|email, password } */
const login = async (req, res) => {
  try {
    const rawUsername =
      typeof req.body.username === "string" ? req.body.username.trim() : "";
    const rawEmail =
      typeof req.body.email === "string" ? req.body.email.trim() : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";

    const identifier = rawEmail || rawUsername;
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "E-post/användarnamn och lösenord krävs." });
    }

    const query = identifier.includes("@")
      ? { email: identifier }
      : { username: identifier };

    const user = await User.findOne(query);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Fel användarnamn/e-post eller lösenord." });
    }

    // använd modellens comparePassword
    const ok =
      typeof user.comparePassword === "function"
        ? await user.comparePassword(password)
        : await bcrypt.compare(password, user.password);

    if (!ok) {
      return res
        .status(401)
        .json({ error: "Fel användarnamn/e-post eller lösenord." });
    }

    const token = createToken(user);
    return res.status(200).json({
      message: "Inloggning lyckades",
      token,
      user: { _id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ error: "Serverfel vid inloggning." });
  }
};

/** PATCH /api/auth/profile  Body: { email?, password? } */
const updateEmail = async (req, res) => {
  const email =
    typeof req.body.email === "string" ? req.body.email.trim() : "";
  const newPassword =
    typeof req.body.password === "string" ? req.body.password : "";

  try {
    const updates = {};
    if (email) updates.email = email;
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "Användare hittades inte." });
    }

    res.status(200).json({ message: "Profil uppdaterad!", user: updatedUser });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(400).json({ error: "Kunde inte uppdatera profilen." });
  }
};

/** GET /api/auth/me */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("email username");
    if (!user)
      return res.status(404).json({ error: "Användare hittades inte." });
    res.status(200).json({ email: user.email, username: user.username });
  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    res.status(500).json({ error: "Kunde inte hämta profil." });
  }
};

/** PATCH /api/auth/username  Body: { username } */
const updateUsername = async (req, res) => {
  const username =
    typeof req.body.username === "string" ? req.body.username.trim() : "";

  try {
    if (!username) {
      return res.status(400).json({ error: "Username krävs." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Användarnamnet är redan upptaget." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { username },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "Användare hittades inte." });
    }

    res.status(200).json({
      message: "Användarnamnet har uppdaterats.",
      username: updatedUser.username,
    });
  } catch (error) {
    console.error("UPDATE USERNAME ERROR:", error);
    res.status(400).json({ error: "Kunde inte uppdatera användarnamnet." });
  }
};

module.exports = { signup, login, updateEmail, getProfile, updateUsername };