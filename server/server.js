const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Ladda miljövariabler
dotenv.config();

// Skapa express-app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importera routes
const applicationRoutes = require("./routes/applicationRoutes");
const authRoutes = require("./routes/authRoutes");

// Koppla routes
app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

// Starta server efter att MongoDB kopplats
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB anslutet");
    app.listen(PORT, () => {
      console.log(`🚀 Server kör på port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB-anslutning misslyckades:", err);
  });