// Export Filter Logic for Smart Finance Transaction Export
// Provides filtering and calculation utilities for PDF export functionality

/**
 * Filter all transactions by type
 * @param {Array} transactions - Array of transaction objects
 * @param {string} type - Transaction type: 'all', 'income', 'expense'
 * @returns {Array} Filtered transactions
 */
export function filterAllTime(transactions, type = 'all') {
  if (!Array.isArray(transactions)) {
    console.warn('filterAllTime: transactions must be an array');
    return [];
  }

  // Return all transactions if type is 'all'
  if (type === 'all') {
    return [...transactions];
  }

  // Filter by specific type
  if (type === 'income' || type === 'expense') {
    return transactions.filter(transaction => 
      transaction.type && transaction.type.toLowerCase() === type.toLowerCase()
    );
  }

  console.warn(`filterAllTime: Invalid type "${type}". Expected 'all', 'income', or 'expense'`);
  return [...transactions];
}

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transaction objects
 * @param {string|Date} startDate - Start date (YYYY-MM-DD format or Date object)
 * @param {string|Date} endDate - End date (YYYY-MM-DD format or Date object)
 * @param {string} type - Transaction type: 'all', 'income', 'expense'
 * @returns {Array} Filtered transactions
 */
export function filterByDateRange(transactions, startDate, endDate, type = 'all') {
  if (!Array.isArray(transactions)) {
    console.warn('filterByDateRange: transactions must be an array');
    return [];
  }

  if (!startDate && !endDate) {
    console.warn('filterByDateRange: At least one date (startDate or endDate) must be provided');
    return filterAllTime(transactions, type);
  }

  try {
    // Convert dates to Date objects for comparison
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Validate dates
    if (start && isNaN(start.getTime())) {
      console.warn('filterByDateRange: Invalid startDate provided');
      return [];
    }
    if (end && isNaN(end.getTime())) {
      console.warn('filterByDateRange: Invalid endDate provided');
      return [];
    }

    // Set end date to end of day for inclusive filtering
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    // Filter transactions by date range
    let filtered = transactions.filter(transaction => {
      if (!transaction.date) return false;

      const transactionDate = new Date(transaction.date);
      if (isNaN(transactionDate.getTime())) return false;

      // Check if transaction date falls within range
      const afterStart = !start || transactionDate >= start;
      const beforeEnd = !end || transactionDate <= end;

      return afterStart && beforeEnd;
    });

    // Apply type filter
    return filterAllTime(filtered, type);

  } catch (error) {
    console.error('filterByDateRange: Error filtering transactions', error);
    return [];
  }
}

/**
 * Filter transactions by specific month and year
 * @param {Array} transactions - Array of transaction objects
 * @param {number} month - Month (0-11, where 0 = January)
 * @param {number} year - Year (e.g., 2024)
 * @param {string} type - Transaction type: 'all', 'income', 'expense'
 * @returns {Array} Filtered transactions
 */
export function filterByMonth(transactions, month, year, type = 'all') {
  if (!Array.isArray(transactions)) {
    console.warn('filterByMonth: transactions must be an array');
    return [];
  }

  // Validate month and year
  if (typeof month !== 'number' || month < 0 || month > 11) {
    console.warn('filterByMonth: month must be a number between 0-11');
    return [];
  }

  if (typeof year !== 'number' || year < 1900 || year > 2100) {
    console.warn('filterByMonth: year must be a valid number');
    return [];
  }

  try {
    // Create start and end dates for the month
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Filter transactions by month
    let filtered = transactions.filter(transaction => {
      if (!transaction.date) return false;

      const transactionDate = new Date(transaction.date);
      if (isNaN(transactionDate.getTime())) return false;

      return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
    });

    // Apply type filter
    return filterAllTime(filtered, type);

  } catch (error) {
    console.error('filterByMonth: Error filtering transactions', error);
    return [];
  }
}

/**
 * Filter transactions by category
 * @param {Array} transactions - Array of transaction objects
 * @param {string} category - Category name to filter by
 * @param {string} type - Transaction type: 'all', 'income', 'expense'
 * @returns {Array} Filtered transactions
 */
export function filterByCategory(transactions, category, type = 'all') {
  if (!Array.isArray(transactions)) {
    console.warn('filterByCategory: transactions must be an array');
    return [];
  }

  if (!category || category === 'all') {
    return filterAllTime(transactions, type);
  }

  // Filter by category (case-insensitive)
  let filtered = transactions.filter(transaction => 
    transaction.category && 
    transaction.category.toLowerCase() === category.toLowerCase()
  );

  // Apply type filter
  return filterAllTime(filtered, type);
}

/**
 * Calculate summary statistics from filtered transactions
 * @param {Array} filteredTransactions - Array of filtered transaction objects
 * @returns {Object} Summary object with totals and statistics
 */
export function calculateSummary(filteredTransactions) {
  if (!Array.isArray(filteredTransactions)) {
    console.warn('calculateSummary: filteredTransactions must be an array');
    return getEmptySummary();
  }

  const summary = {
    // Basic counts
    totalTransactions: filteredTransactions.length,
    incomeCount: 0,
    expenseCount: 0,
    
    // Financial totals
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    
    // Average amounts
    avgIncome: 0,
    avgExpense: 0,
    avgTransaction: 0,
    
    // Date range
    earliestDate: null,
    latestDate: null,
    
    // Category breakdown
    categories: {},
    topIncomeCategory: null,
    topExpenseCategory: null,
    
    // Additional metrics
    largestIncome: 0,
    largestExpense: 0,
    smallestIncome: Number.MAX_VALUE,
    smallestExpense: Number.MAX_VALUE
  };

  if (filteredTransactions.length === 0) {
    return getEmptySummary();
  }

  // Process each transaction
  filteredTransactions.forEach(transaction => {
    const amount = Number(transaction.amount) || 0;
    const type = transaction.type?.toLowerCase();
    const category = transaction.category || 'Uncategorized';
    const date = new Date(transaction.date);

    // Count transactions by type
    if (type === 'income') {
      summary.incomeCount++;
      summary.totalIncome += amount;
      
      // Track income extremes
      summary.largestIncome = Math.max(summary.largestIncome, amount);
      if (amount > 0) {
        summary.smallestIncome = Math.min(summary.smallestIncome, amount);
      }
      
    } else if (type === 'expense') {
      summary.expenseCount++;
      summary.totalExpense += amount;
      
      // Track expense extremes
      summary.largestExpense = Math.max(summary.largestExpense, amount);
      if (amount > 0) {
        summary.smallestExpense = Math.min(summary.smallestExpense, amount);
      }
    }

    // Track date range
    if (!isNaN(date.getTime())) {
      if (!summary.earliestDate || date < summary.earliestDate) {
        summary.earliestDate = date;
      }
      if (!summary.latestDate || date > summary.latestDate) {
        summary.latestDate = date;
      }
    }

    // Category breakdown
    if (!summary.categories[category]) {
      summary.categories[category] = {
        income: 0,
        expense: 0,
        total: 0,
        count: 0
      };
    }
    
    summary.categories[category].count++;
    if (type === 'income') {
      summary.categories[category].income += amount;
    } else if (type === 'expense') {
      summary.categories[category].expense += amount;
    }
    summary.categories[category].total += amount;
  });

  // Calculate derived values
  summary.netBalance = summary.totalIncome - summary.totalExpense;
  
  // Calculate averages
  if (summary.incomeCount > 0) {
    summary.avgIncome = summary.totalIncome / summary.incomeCount;
  }
  if (summary.expenseCount > 0) {
    summary.avgExpense = summary.totalExpense / summary.expenseCount;
  }
  if (summary.totalTransactions > 0) {
    summary.avgTransaction = (summary.totalIncome + summary.totalExpense) / summary.totalTransactions;
  }

  // Handle edge cases for smallest amounts
  if (summary.smallestIncome === Number.MAX_VALUE) {
    summary.smallestIncome = 0;
  }
  if (summary.smallestExpense === Number.MAX_VALUE) {
    summary.smallestExpense = 0;
  }

  // Find top categories
  const categoryEntries = Object.entries(summary.categories);
  
  // Top income category
  const incomeCategories = categoryEntries
    .filter(([_, data]) => data.income > 0)
    .sort((a, b) => b[1].income - a[1].income);
  summary.topIncomeCategory = incomeCategories.length > 0 ? {
    name: incomeCategories[0][0],
    amount: incomeCategories[0][1].income
  } : null;

  // Top expense category
  const expenseCategories = categoryEntries
    .filter(([_, data]) => data.expense > 0)
    .sort((a, b) => b[1].expense - a[1].expense);
  summary.topExpenseCategory = expenseCategories.length > 0 ? {
    name: expenseCategories[0][0],
    amount: expenseCategories[0][1].expense
  } : null;

  return summary;
}

/**
 * Get empty summary object for edge cases
 * @returns {Object} Empty summary object
 */
function getEmptySummary() {
  return {
    totalTransactions: 0,
    incomeCount: 0,
    expenseCount: 0,
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    avgIncome: 0,
    avgExpense: 0,
    avgTransaction: 0,
    earliestDate: null,
    latestDate: null,
    categories: {},
    topIncomeCategory: null,
    topExpenseCategory: null,
    largestIncome: 0,
    largestExpense: 0,
    smallestIncome: 0,
    smallestExpense: 0
  };
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'INR') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0.00';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));
}

/**
 * Format date for display in IST
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  } catch (error) {
    console.error('formatDate: Error formatting date', error);
    return 'Invalid Date';
  }
}

/**
 * Get month name from month number
 * @param {number} month - Month number (0-11)
 * @returns {string} Month name
 */
export function getMonthName(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  if (typeof month !== 'number' || month < 0 || month > 11) {
    return 'Invalid Month';
  }
  
  return monthNames[month];
}

/**
 * Validate transaction object structure
 * @param {Object} transaction - Transaction object to validate
 * @returns {boolean} True if valid transaction
 */
export function isValidTransaction(transaction) {
  if (!transaction || typeof transaction !== 'object') {
    return false;
  }

  // Required fields
  const hasRequiredFields = 
    transaction.hasOwnProperty('amount') &&
    transaction.hasOwnProperty('type') &&
    transaction.hasOwnProperty('date');

  // Valid type
  const validType = ['income', 'expense'].includes(transaction.type?.toLowerCase());

  // Valid amount
  const validAmount = typeof transaction.amount === 'number' && 
                     !isNaN(transaction.amount) && 
                     transaction.amount >= 0;

  // Valid date
  const validDate = transaction.date && !isNaN(new Date(transaction.date).getTime());

  return hasRequiredFields && validType && validAmount && validDate;
}

/**
 * Clean and validate transactions array
 * @param {Array} transactions - Array of transactions to clean
 * @returns {Array} Cleaned array of valid transactions
 */
export function cleanTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    console.warn('cleanTransactions: input must be an array');
    return [];
  }

  return transactions.filter(transaction => {
    const isValid = isValidTransaction(transaction);
    if (!isValid) {
      console.warn('cleanTransactions: Invalid transaction found and removed', transaction);
    }
    return isValid;
  });
}

// Export all functions as a default object for convenience
export default {
  filterAllTime,
  filterByDateRange,
  filterByMonth,
  filterByCategory,
  calculateSummary,
  formatCurrency,
  formatDate,
  getMonthName,
  isValidTransaction,
  cleanTransactions
};
