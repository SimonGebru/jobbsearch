const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Om ingen header finns
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Ingen token, åtkomst nekad." });
  }

  const token = authHeader.split(" ")[1]; // "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Lägg till userId i request-objektet
    next();
  } catch (error) {
    res.status(403).json({ error: "Ogiltig token." });
  }
};

module.exports = requireAuth;