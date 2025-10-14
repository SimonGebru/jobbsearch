const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Ingen token, åtkomst nekad." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "superhemligjwtkod123"
    );

    // 🔑 Tillgängliggör hela användaren på req.user
    req.user = decoded;

    // 🔒 Du kan fortfarande ha dessa kvar om du använder dem någonstans
    req.userId = decoded.id;
    req.userRole = decoded.role || "user";

    next();
  } catch (error) {
    console.error("JWT-fel:", error.message);
    return res.status(403).json({ error: "Ogiltig eller utgången token." });
  }
};

module.exports = requireAuth;