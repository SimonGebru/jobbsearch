const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

// Skapa en transporter för Ethereal (för test-mejl)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
  },
});

// 🔐 Skicka återställningsmejl
const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "Ingen användare med denna e-post." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m", // Giltig i 15 minuter
    });

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      from: '"JobbAppen" <no-reply@jobbsok.se>',
      to: email,
      subject: "Återställ ditt lösenord",
      html: `
        <p>Hej ${user.username},</p>
        <p>Klicka på länken nedan för att återställa ditt lösenord:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>OBS: Länken är giltig i 15 minuter.</p>
      `,
    });

    res.status(200).json({ message: "Återställningslänk skickad." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Något gick fel vid utskick." });
  }
};

// 🔒 Återställ lösenord (POST /reset-password/:token)
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Användaren finns inte." });

    user.password = password; // Triggar pre('save') i modellen som hashar lösenordet
    await user.save();

    res.status(200).json({ message: "Lösenordet har uppdaterats." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Token ogiltig eller utgången." });
  }
};

module.exports = {
  sendResetEmail,
  resetPassword,
};