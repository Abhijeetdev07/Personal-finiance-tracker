const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["income", "expense"], required: true },
  category: { type: String, required: true },
  date: { type: Date, required: true },
  note: { type: String },
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

module.exports = mongoose.model("Transaction", transactionSchema);
