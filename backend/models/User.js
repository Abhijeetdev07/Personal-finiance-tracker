const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  phone: { type: String, default: "" },
  countryCode: { type: String, default: "+91" },
  bio: { type: String, default: "" },
  resetPasswordOtpHash: { type: String },
  resetPasswordOtpExpiresAt: { type: Date },
  resetPasswordOtpRetryCount: { type: Number, default: 0 },
  resetPasswordState: { type: String, enum: ['requested', 'verified'], default: null },
  // Rate limiting for forgot-password OTP requests
  resetOtpRequestCount: { type: Number, default: 0 },
  resetOtpRequestWindowStart: { type: Date },
  
  // Verification flags
  isVerifiedHuman: { type: Boolean, default: false },
}, { 
  timestamps: {
    createdAt: true,
    updatedAt: true,
    currentTime: () => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      return new Date(now.getTime() + istOffset);
    }
  }
});

module.exports = mongoose.model("User", userSchema);
