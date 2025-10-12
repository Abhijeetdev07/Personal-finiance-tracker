const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendPasswordResetOtp, sendWelcomeEmail } = require("../utils/emailSender");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    let { username, email, password, firstName, lastName } = req.body;

    // Normalize inputs
    username = typeof username === "string" ? username.trim() : username;
    email = typeof email === "string" ? email.trim() : email;
    password = typeof password === "string" ? password.trim() : password;
    firstName = typeof firstName === "string" ? firstName.replace(/\s/g, '') : firstName;
    lastName = typeof lastName === "string" ? lastName.replace(/\s/g, '') : lastName;

    // Check for empty fields (last name is optional)
    const isUsernameEmpty = !username;
    const isEmailEmpty = !email;
    const isPasswordEmpty = !password;
    const isFirstNameEmpty = !firstName;
    const isLastNameEmpty = !lastName; // kept for conditional validation below
    
    if (isUsernameEmpty && isEmailEmpty && isPasswordEmpty && isFirstNameEmpty) {
      return res.status(400).json({ error: "Username, email, password and first name are required" });
    }
    if (isFirstNameEmpty) {
      return res.status(400).json({ error: "First name is required" });
    }
    // Last name is optional
    if (isUsernameEmpty) {
      return res.status(400).json({ error: "Username is required" });
    }
    if (isEmailEmpty) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (isPasswordEmpty) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Username validation: min 5 chars, only letters and numbers
    if (typeof username !== "string") {
      return res.status(400).json({ error: "Username must be a string" });
    }
    if (username.length < 5) {
      return res.status(400).json({ error: "Username must be at least 5 characters long" });
    }
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (!usernamePattern.test(username)) {
      return res.status(400).json({ error: "Username can only contain letters and numbers" });
    }

    // First name validation: min 3 chars, letters only (no spaces, numbers, symbols)
    const namePattern = /^[a-zA-Z]+$/;
    if (!namePattern.test(firstName)) {
      return res.status(400).json({ error: "First name can only contain letters (no spaces, numbers, or symbols)" });
    }
    if (firstName.length < 3) {
      return res.status(400).json({ error: "First name must be at least 3 characters long" });
    }
    if (!isLastNameEmpty && !namePattern.test(lastName)) {
      return res.status(400).json({ error: "Last name can only contain letters (no spaces, numbers, or symbols)" });
    }

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

    // Check if email or username already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: "Email already exists" });
    
    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: "Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashed, firstName, lastName });

    // Fire-and-forget welcome email (non-blocking)
    (async () => {
      try {
        await sendWelcomeEmail({ to: user.email, username: user.username, firstName: user.firstName });
      } catch (e) {
        console.error("Welcome email failed:", e?.message || e);
      }
    })();

    // Issue token on registration
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ 
      message: "User registered",
      token,
      user: { id: user._id, email: user.email, username: user.username, firstName: user.firstName, lastName: user.lastName }
    });
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

    res.json({ 
      message: "Login successful", 
      token, 
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  // Set a timeout for the entire request (60 seconds)
  const requestTimeout = setTimeout(() => {
    if (!res.headersSent) {
      console.error("Forgot password request timeout");
      res.status(408).json({ error: "Request timeout - please try again" });
    }
  }, 60000);

  try {
    console.log("🚀 FORGOT PASSWORD ENDPOINT CALLED!");
    const { identifier } = req.body;

    if (!identifier) {
      clearTimeout(requestTimeout);
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
      clearTimeout(requestTimeout);
      return res.json(genericResponse);
    }

    // Server-side rate limit: 3 requests per 10 minutes per user
    const WINDOW_MS = 10 * 60 * 1000;
    const now = new Date();
    if (!user.resetOtpRequestWindowStart || (now - user.resetOtpRequestWindowStart) > WINDOW_MS) {
      user.resetOtpRequestWindowStart = now;
      user.resetOtpRequestCount = 0;
    }
    if (user.resetOtpRequestCount >= 3) {
      // Respond with generic response to avoid enumeration, but do not send OTP
      clearTimeout(requestTimeout);
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
    user.resetOtpRequestCount += 1;
    await user.save();

    // Send OTP via email with timeout handling
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

    clearTimeout(requestTimeout);
    res.json(genericResponse);
  } catch (err) {
    console.error("Forgot password error:", err);
    clearTimeout(requestTimeout);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
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
