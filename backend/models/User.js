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
  // Device tracking
  activeSessions: [{
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: ['desktop', 'mobile', 'tablet'], required: true },
    browser: { type: String, required: true },
    os: { type: String, required: true },
    location: {
      ip: { type: String, required: true },
      country: { type: String, default: 'Unknown' },
      city: { type: String, default: 'Unknown' },
      region: { type: String, default: 'Unknown' },
      timezone: { type: String, default: 'UTC' },
      isp: { type: String, default: 'Unknown' },
      latitude: { type: Number },
      longitude: { type: Number },
      formatted: { type: String, default: 'Unknown Location' }
    },
    lastActive: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    loginTime: { type: Date, default: Date.now }
  }],
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
