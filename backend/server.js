const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const transactionRoutes = require("./routes/transactions");
const profileRoutes = require("./routes/profile");

const app = express(); // <-- initialize app first

// Middleware
app.use(express.json());
const allowedOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean)
  : ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigin, credentials: true }));

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
 // console.log("Backend is working!");
});

// Auth routes
app.use("/api/auth", authRoutes);

// Transaction routes
app.use("/api/transactions", transactionRoutes);

// Profile routes
app.use("/api/profile", profileRoutes);

// Protected example route
app.get("/api/protected", require("./middleware/auth"), (req, res) => {
  res.json({ message: "You accessed a protected route!", user: req.user });
});

// Connect to MongoDB once (serverless-friendly) and export app for Vercel
let mongoConnectionPromise = null;

function connectToMongoOnce() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }
  if (!mongoConnectionPromise) {
    mongoConnectionPromise = mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected");
      })
      .catch((err) => {
        console.error("MongoDB error:", err);
        // Reset the promise so we can retry on next invocation
        mongoConnectionPromise = null;
        throw err;
      });
  }
  return mongoConnectionPromise;
}

// Kick off connection at cold start (non-blocking for import)
connectToMongoOnce().catch(() => {});

module.exports = app;