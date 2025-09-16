const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const applicationRoutes = require("../api/routes/applicationRoutes");
const authRoutes = require("../api/routes/authRoutes");

app.use("/api/applications", applicationRoutes);
app.use("/api/auth", authRoutes);

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI saknas i env");
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET || "superhemligjwtkod123";
const ETHEREAL_USER =
  process.env.ETHEREAL_USER || "eric.dubuque@ethereal.email";
const ETHEREAL_PASS = process.env.ETHEREAL_PASS || "5stEdNytsv6xEPUbaV";

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGO_URI);
  isConnected = true;
  console.log("✅ MongoDB anslutet");
}

module.exports = { app, connectDB, JWT_SECRET, ETHEREAL_USER, ETHEREAL_PASS };
