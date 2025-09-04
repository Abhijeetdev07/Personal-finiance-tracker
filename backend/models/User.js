const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordOtpHash: { type: String },
  resetPasswordOtpExpiresAt: { type: Date },
  resetPasswordOtpRetryCount: { type: Number, default: 0 },
  resetPasswordState: { type: String, enum: ['requested', 'verified'], default: null },
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
