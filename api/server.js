// api/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://jobsearch-s1337.web.app",
  "https://jobsearch-s1337.firebaseapp.com",
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());


app.get("/api/health", (_req, res) => res.json({ ok: true }));


app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI saknas i env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB ansluten");
    const PORT = process.env.PORT || 10000; 
    app.listen(PORT, () => console.log("🚀 API lyssnar på", PORT));
  })
  .catch((err) => {
    console.error("❌ MongoDB-fel:", err.message);
    process.exit(1);
  });

module.exports = app;