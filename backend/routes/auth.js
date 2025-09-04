const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendPasswordResetOtp } = require("../utils/emailSender");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Strong password validation: min 8, upper, lower, number, special
    if (typeof password !== "string") {
      return res.status(400).json({ error: "Password must be a string" });
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        error:
          "Password must be 8-12 chars and include upper, lower, number, and special character",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashed });

    res.status(201).json({ message: "User registered", user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body;

    const loginId = identifier || email || username;
    if (!loginId || !password) {
      return res.status(400).json({ error: "Email/username and password are required" });
    }

    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId);
    const query = isEmailFormat ? { email: loginId } : { username: loginId };

    const user = await User.findOne(query);
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token, user: { id: user._id, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("🚀 FORGOT PASSWORD ENDPOINT CALLED!");
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({ error: "Email or username is required" });
    }

    // Find user by email or username
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmailFormat ? { email: identifier } : { username: identifier };
    console.log("🔎 Forgot-password identifier:", identifier);
    console.log("🔎 Forgot-password query:", query);
    const user = await User.findOne(query);
    console.log("🔎 Forgot-password user found:", !!user, user?.email || user?.username || null);

    // Always return generic response for security (don't reveal if user exists)
    const genericResponse = {
      message: "If an account exists with that email or username, you will receive a password reset OTP."
    };

    if (!user) {
      return res.json(genericResponse);
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP and set expiry (10 minutes)
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset data
    user.resetPasswordOtpHash = otpHash;
    user.resetPasswordOtpExpiresAt = otpExpiresAt;
    user.resetPasswordState = 'requested';
    user.resetPasswordOtpRetryCount = 0;
    await user.save();

    // Send OTP via email
    try {
      await sendPasswordResetOtp({ to: user.email, otp });
      console.log(`Password reset OTP sent to ${user.email}`);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Log OTP to console for testing purposes
      console.log(`🔑 OTP for ${user.email}: ${otp}`);
      console.log(`⏰ OTP expires at: ${otpExpiresAt}`);
      console.log(`📧 Email failed, but OTP is available above for testing`);
      console.log(`🚀 TESTING: OTP should be visible now!`);
      // Still return success to user for security
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify Reset OTP
router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ error: "Identifier and OTP are required" });
    }

    // Find user by email or username
    const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const query = isEmailFormat ? { email: identifier } : { username: identifier };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Check if OTP exists and hasn't expired
    if (!user.resetPasswordOtpHash || !user.resetPasswordOtpExpiresAt) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (user.resetPasswordOtpExpiresAt < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Check retry count limit (max 5 attempts)
    if (user.resetPasswordOtpRetryCount >= 5) {
      return res.status(400).json({ error: "Too many failed attempts. Please request a new OTP." });
    }

    // Compare provided OTP with stored hash
    const isValidOtp = await bcrypt.compare(otp, user.resetPasswordOtpHash);

    if (!isValidOtp) {
      // Increment retry count
      user.resetPasswordOtpRetryCount += 1;
      await user.save();
      
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP is valid - update user state
    user.resetPasswordState = 'verified';
    await user.save();

    // Generate short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
      { 
        type: 'password_reset', 
        userId: user._id 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '15m' }
    );

    res.json({ 
      message: "OTP verified successfully", 
      resetToken: resetToken 
    });

  } catch (err) {
    console.error("Verify reset OTP error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, identifier, otp, newPassword } = req.body;

    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ error: "New password is required" });
    }

    // Reuse strong password regex from register route
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be 8-12 chars and include upper, lower, number, and special character",
      });
    }

    let user = null;

    if (token) {
      // Token-based reset (preferred)
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload.type !== "password_reset") {
          return res.status(400).json({ error: "Invalid reset token" });
        }
        user = await User.findById(payload.userId);
        if (!user) return res.status(400).json({ error: "Invalid reset token" });
      } catch (err) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
    } else {
      // Fallback: identifier + otp
      if (!identifier || !otp) {
        return res.status(400).json({ error: "Identifier and OTP are required" });
      }
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const query = isEmailFormat ? { email: identifier } : { username: identifier };
      user = await User.findOne(query);
      if (!user) return res.status(400).json({ error: "Invalid OTP" });
      if (!user.resetPasswordOtpHash || !user.resetPasswordOtpExpiresAt) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
      if (user.resetPasswordOtpExpiresAt < new Date()) {
        return res.status(400).json({ error: "OTP has expired" });
      }
      const isValidOtp = await bcrypt.compare(otp, user.resetPasswordOtpHash);
      if (!isValidOtp) {
        return res.status(400).json({ error: "Invalid OTP" });
      }
    }

    // Enforce: new password must differ from current password
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (isSameAsCurrent) {
      return res.status(400).json({
        error: "New password must be different from your current one."
      });
    }

    // Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    // Clear reset fields
    user.resetPasswordOtpHash = null;
    user.resetPasswordOtpExpiresAt = null;
    user.resetPasswordOtpRetryCount = 0;
    user.resetPasswordState = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
