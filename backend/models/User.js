const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetPasswordOtpHash: { type: String },
  resetPasswordOtpExpiresAt: { type: Date },
  resetPasswordOtpRetryCount: { type: Number, default: 0 },
  resetPasswordState: { type: String, enum: ['requested', 'verified'], default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
