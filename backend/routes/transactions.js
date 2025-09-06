// const express = require("express");
// const auth = require("../middleware/auth");
// const Transaction = require("../models/Transaction");

// const router = express.Router();

// // GET all transactions for logged-in user
// router.get("/", auth, async (req, res) => {
//   try {
//     const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
//     res.json(transactions);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST add new transaction
// router.post("/", auth, async (req, res) => {
//   try {
//     const { amount, type, category, date, note } = req.body;
//     const newTx = await Transaction.create({
//       user: req.user.id,
//       amount,
//       type,
//       category,
//       date,
//       note,
//     });
//     res.status(201).json(newTx);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE transaction by ID
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const tx = await Transaction.findById(req.params.id);
//     if (!tx) return res.status(404).json({ error: "Transaction not found" });
//     if (tx.user.toString() !== req.user.id)
//       return res.status(403).json({ error: "Not authorized" });

//     await tx.remove();
//     res.json({ message: "Transaction deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
// const express = require("express");
// const auth = require("../middleware/auth");
// const Transaction = require("../models/Transaction");

// const router = express.Router();

// // GET all transactions for logged-in user
// router.get("/", auth, async (req, res) => {
//   try {
//     const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
//     res.json(transactions);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST add new transaction
// router.post("/", auth, async (req, res) => {
//   try {
//     const { amount, type, category, date, note } = req.body;
//     const newTx = await Transaction.create({
//       user: req.user.id,
//       amount,
//       type,
//       category,
//       date,
//       note,
//     });
//     res.status(201).json(newTx);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE transaction by ID
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const tx = await Transaction.findById(req.params.id);
//     if (!tx) return res.status(404).json({ error: "Transaction not found" });
//     if (tx.user.toString() !== req.user.id)
//       return res.status(403).json({ error: "Not authorized" });

//     await tx.remove();
//     res.json({ message: "Transaction deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const router = express.Router();

// GET all transactions for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new transaction
router.post("/", auth, async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;
    
    // Convert date to IST if provided
    let istDate = date;
    if (date) {
      const inputDate = new Date(date);
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      istDate = new Date(inputDate.getTime() + istOffset);
    }
    
    const newTx = await Transaction.create({
      user: req.user.id,
      amount,
      type,
      category,
      date: istDate,
      note,
    });
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update transaction by ID
router.put("/:id", auth, async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;
    const tx = await Transaction.findById(req.params.id);
    
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.user.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    // Convert date to IST if provided
    let istDate = date;
    if (date) {
      const inputDate = new Date(date);
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      istDate = new Date(inputDate.getTime() + istOffset);
    }

    const updatedTx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date: istDate, note },
      { new: true }
    );
    
    res.json(updatedTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction by ID
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const tx = await Transaction.findById(req.params.id);
//     if (!tx) return res.status(404).json({ error: "Transaction not found" });
//     if (tx.user.toString() !== req.user.id)
//       return res.status(403).json({ error: "Not authorized" });

//     await tx.remove();
//     res.json({ message: "Transaction deleted" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.delete("/:id", auth, async (req, res) => {
    try {
      const tx = await Transaction.findById(req.params.id);
      if (!tx) return res.status(404).json({ error: "Transaction not found" });
      if (tx.user.toString() !== req.user.id)
        return res.status(403).json({ error: "Not authorized" });
  
      await tx.deleteOne(); // <-- fixed line
      res.json({ message: "Transaction deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
