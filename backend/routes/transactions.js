const express = require("express");
const auth = require("../middleware/auth");
const Transaction = require("../models/Transaction");

const router = express.Router();

// GET all transactions for logged-in user with optional filtering
router.get("/", auth, async (req, res) => {
  try {
    const { startDate, endDate, type, category, limit, page } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Include the entire end date by setting time to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateTime;
      }
    }
    
    // Transaction type filtering
    if (type && (type === 'income' || type === 'expense')) {
      filter.type = type;
    }
    
    // Category filtering
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Pagination setup
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 0; // 0 means no limit
    const skip = limitNumber > 0 ? (pageNumber - 1) * limitNumber : 0;
    
    // Build query
    let query = Transaction.find(filter).sort({ date: -1 });
    
    if (limitNumber > 0) {
      query = query.skip(skip).limit(limitNumber);
    }
    
    const transactions = await query;
    
    // Get total count for pagination info
    const totalCount = await Transaction.countDocuments(filter);
    
    // Send response with pagination info if limit is specified
    if (limitNumber > 0) {
      res.json({
        transactions,
        pagination: {
          page: pageNumber,
          limit: limitNumber,
          total: totalCount,
          pages: Math.ceil(totalCount / limitNumber)
        }
      });
    } else {
      // For backward compatibility, send just transactions array
      res.json(transactions);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add new transaction
router.post("/", auth, async (req, res) => {
  try {
    const { amount, type, category, date, note } = req.body;
    
    // Use the provided date directly (frontend sends YYYY-MM-DD format)
    let transactionDate = date;
    if (date) {
      // Create date object from YYYY-MM-DD format
      transactionDate = new Date(date);
    } else {
      // Default to current date if no date provided
      transactionDate = new Date();
    }
    
    const newTx = await Transaction.create({
      user: req.user.id,
      amount,
      type,
      category,
      date: transactionDate,
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

    // Use the provided date directly (frontend sends YYYY-MM-DD format)
    let transactionDate = date;
    if (date) {
      // Create date object from YYYY-MM-DD format
      transactionDate = new Date(date);
    }

    const updatedTx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { amount, type, category, date: transactionDate, note },
      { new: true }
    );
    
    res.json(updatedTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE transaction by ID
router.delete("/:id", auth, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ error: "Transaction not found" });
    if (tx.user.toString() !== req.user.id)
      return res.status(403).json({ error: "Not authorized" });

    await tx.deleteOne();
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transactions for export with filtering
router.get("/export", auth, async (req, res) => {
  try {
    const { startDate, endDate, type, category, month, year, exportType } = req.query;
    
    // Build filter object
    const filter = { user: req.user.id };
    
    // Handle different export types
    if (exportType === 'monthly' && month !== undefined && year !== undefined) {
      // Monthly export - filter by specific month and year
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      const startOfMonth = new Date(yearNum, monthNum, 1);
      const endOfMonth = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999);
      
      filter.date = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    } else if (exportType === 'date-range' && (startDate || endDate)) {
      // Date range export
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        filter.date.$lte = endDateTime;
      }
    }
    // For 'all-time' export, no date filter is applied
    
    // Transaction type filtering
    if (type && type !== 'all' && (type === 'income' || type === 'expense')) {
      filter.type = type;
    }
    
    // Category filtering
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    // Fetch transactions sorted by date (newest first)
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    // Calculate summary statistics
    const summary = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0
    };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        summary.totalIncome += transaction.amount;
        summary.incomeCount++;
      } else if (transaction.type === 'expense') {
        summary.totalExpense += transaction.amount;
        summary.expenseCount++;
      }
    });
    
    summary.balance = summary.totalIncome - summary.totalExpense;
    
    // Return transactions with summary and filter info
    res.json({
      success: true,
      data: {
        transactions,
        summary,
        filterInfo: {
          exportType: exportType || 'all-time',
          type: type || 'all',
          category: category || 'all',
          startDate: startDate || null,
          endDate: endDate || null,
          month: month || null,
          year: year || null,
          appliedAt: new Date().toISOString()
        }
      }
    });
    
  } catch (err) {
    console.error('Export API Error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch export data' 
    });
  }
});

// GET transaction statistics for dashboard
router.get("/stats", auth, async (req, res) => {
  try {
    const { period } = req.query; // 'week', 'month', 'year', or custom date range
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { $gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { $gte: monthAgo };
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear(), 0, 1);
        dateFilter = { $gte: yearAgo };
        break;
      default:
        // No date filter for all-time stats
        break;
    }
    
    const filter = { user: req.user.id };
    if (Object.keys(dateFilter).length > 0) {
      filter.date = dateFilter;
    }
    
    // Aggregate statistics
    const stats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
    
    // Category breakdown
    const categoryStats = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { type: '$type', category: '$category' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    // Format response
    const formattedStats = {
      income: { total: 0, count: 0, avgAmount: 0 },
      expense: { total: 0, count: 0, avgAmount: 0 },
      balance: 0,
      categories: categoryStats
    };
    
    stats.forEach(stat => {
      if (stat._id === 'income') {
        formattedStats.income = {
          total: stat.total,
          count: stat.count,
          avgAmount: stat.avgAmount
        };
      } else if (stat._id === 'expense') {
        formattedStats.expense = {
          total: stat.total,
          count: stat.count,
          avgAmount: stat.avgAmount
        };
      }
    });
    
    formattedStats.balance = formattedStats.income.total - formattedStats.expense.total;
    
    res.json({
      success: true,
      period: period || 'all-time',
      stats: formattedStats
    });
    
  } catch (err) {
    console.error('Stats API Error:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to fetch statistics' 
    });
  }
});

module.exports = router;