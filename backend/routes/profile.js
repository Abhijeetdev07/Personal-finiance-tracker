const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controllers/profileController");
const auth = require("../middleware/auth");

// Apply authentication middleware to all profile routes
router.use(auth);

// GET /api/profile - Get user profile
router.get("/", getProfile);

// PUT /api/profile - Update user profile
router.put("/", updateProfile);

module.exports = router;
