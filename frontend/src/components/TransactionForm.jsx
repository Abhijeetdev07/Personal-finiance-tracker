
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../utils/api";
import { loadCategories } from "../utils/categories";
import { useNotification } from "../context/NotificationContext";

export default function TransactionForm({ token, onAdd, currentBalance = 0 }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [isProceeding, setIsProceeding] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const cats = loadCategories();
    setCategories(cats);
    if (!category && cats.length > 0) {
      setCategory(cats[0]);
    }
    
    // Set current date as default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setDate(formattedDate);
  }, []);

  const displayCategories = useMemo(() => {
    const withoutOther = categories.filter((c) => c.toLowerCase() !== "other");
    const hasOther = categories.some((c) => c.toLowerCase() === "other");
    return hasOther ? [...withoutOther, "Other"] : withoutOther;
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check balance for expense transactions and show warning if needed
    if (type === "expense") {
      const expenseAmount = Number(amount);
      if (expenseAmount > currentBalance) {
        // Show warning dialog instead of blocking
        setPendingTransaction({
          amount: Number(amount),
          type,
          category,
          date,
          note,
        });
        setShowBalanceWarning(true);
        return;
      }
    }
    
    // Proceed with transaction if no warning needed
    await submitTransaction({
      amount: Number(amount),
      type,
      category,
      date,
      note,
    });
  };

  const submitTransaction = async (transactionData) => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify(transactionData),
      });

      const newTx = await res.json();
      if (!res.ok) throw new Error(newTx.error || "Failed to add");

      // Update parent list - pass the new transaction directly
      onAdd(newTx);

      // Reset form
      setAmount("");
      setType("income");
      setCategory(categories[0] || "");
      // Set current date after successful submission
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setDate(formattedDate);
      setNote("");
      
      showSuccess("Transaction added successfully!");
    } catch (err) {
      console.error("Add error:", err);
      showError("Failed to add transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTransaction = async () => {
    setIsProceeding(true);
    setShowBalanceWarning(false);
    await submitTransaction(pendingTransaction);
    setPendingTransaction(null);
    setIsProceeding(false);
  };

  const handleCancelTransaction = () => {
    setShowBalanceWarning(false);
    setPendingTransaction(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Add Transaction</h2>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Current Balance:</span>
            <span className={`ml-1 font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{currentBalance.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 max-[800px]:flex-col lg:flex-row">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded lg:w-1/3 w-full"
            required
          />
          <div className="relative lg:w-1/3 w-full">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border p-2 rounded w-full cursor-pointer appearance-none pr-8"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative lg:w-1/3 w-full">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded w-full cursor-pointer appearance-none pr-8"
              required
            >
              {displayCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {displayCategories.length === 0 && <option value="" disabled>No categories</option>}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded lg:w-1/3 w-full cursor-pointer"
            required
          />
          <input
            type="text"
            placeholder="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="border p-2 rounded lg:w-1/3 w-full"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded lg:w-auto w-full cursor-pointer ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>

      {/* Balance Warning Dialog */}
      <AnimatePresence>
        {showBalanceWarning && pendingTransaction && (
          <motion.div 
            className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="bg-white rounded-lg p-4 sm:p-6 max-w-xs sm:max-w-sm mx-2 sm:mx-4 shadow-xl"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                duration: 0.3 
              }}
            >
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Insufficient Balance Warning</h3>
            </div>
            
            <div className="mb-3 sm:mb-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                You're trying to spend <span className="font-semibold text-red-600" style={{ paddingLeft: "5px", paddingRight: "5px" }}>₹{pendingTransaction.amount.toLocaleString()}</span>
                but you only have <span className="font-semibold text-green-600">₹{currentBalance.toLocaleString()}</span> available.
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                This will result in a negative balance of <span className="font-semibold text-red-600">₹{(pendingTransaction.amount - currentBalance).toLocaleString()}</span>.
              </p>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                onClick={handleCancelTransaction}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirmTransaction}
                disabled={isProceeding}
                className={`flex-1 px-3 sm:px-4 py-2 text-white text-xs sm:text-sm rounded transition-colors ${
                  isProceeding 
                    ? 'bg-yellow-400 cursor-not-allowed' 
                    : 'bg-yellow-500 hover:bg-yellow-600'
                }`}
                whileHover={!isProceeding ? { scale: 1.05 } : {}}
                whileTap={!isProceeding ? { scale: 0.95 } : {}}
              >
                {isProceeding ? 'Proceeding...' : 'Yes, Proceed'}
              </motion.button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
