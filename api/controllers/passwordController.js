const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET || "superhemligjwtkod123";


function resolveBaseUrl(req) {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}


function isEmailDisabled() {

  return process.env.DISABLE_EMAIL === "1";
}


const sendResetEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E-postadress saknas." });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ error: "Ingen användare med denna e-post." });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
    const resetUrl = `${resolveBaseUrl(req)}/reset-password/${token}`;

 
    if (isEmailDisabled()) {
      console.log("🧪 [DEV] Skulle skicka återställningslänk till:", email);
      console.log("🔗 [DEV] Reset URL:", resetUrl);
      return res.json({
        ok: true,
        message: "Stub: ingen e-post skickades (DISABLE_EMAIL=1).",
        resetUrl, // praktiskt för frontend-test
      });
    }

    // PRODUKTION: riktig sändning (om/när du vill aktivera)
    const ETHEREAL_USER = process.env.ETHEREAL_USER;
    const ETHEREAL_PASS = process.env.ETHEREAL_PASS;
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: ETHEREAL_USER, pass: ETHEREAL_PASS },
    });

    const info = await transporter.sendMail({
      from: `"JobbAppen" <no-reply@jobbsok.se>`,
      to: email,
      subject: "Återställ ditt lösenord",
      html: `
        <p>Hej ${user.username},</p>
        <p>Klicka på länken nedan för att återställa ditt lösenord:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>OBS: Länken är giltig i 15 minuter.</p>
      `,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log("✉️  Ethereal preview:", preview);

    return res.status(200).json({ message: "Återställningslänk skickad." });
  } catch (error) {
    console.error("sendResetEmail error:", error);
    return res.status(500).json({ error: "Något gick fel vid utskick." });
  }
};

// 🔒 Oförändrad, funkar både i dev och prod
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return res.status(400).json({ error: "Token saknas." });
    if (!password || password.length < 6)
      return res.status(400).json({ error: "Lösenordet är för kort (minst 6 tecken)." });

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "Användaren finns inte." });

    user.password = password; // triggar pre('save') → bcryptjs-hash
    await user.save();

    return res.status(200).json({ message: "Lösenordet har uppdaterats." });
  } catch (error) {
    console.error("resetPassword error:", error);
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(400).json({ error: "Token ogiltig eller utgången." });
    }
    return res.status(500).json({ error: "Kunde inte återställa lösenord." });
  }
};

module.exports = { sendResetEmail, resetPassword };