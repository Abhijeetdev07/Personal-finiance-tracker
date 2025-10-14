import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateToIST } from "../utils/api";
import { loadCategories } from "../utils/categories";
import { useNotification } from "../context/NotificationContext";

export default function EditTransactionModal({ transaction, isOpen, onClose, onSave, currentBalance = 0, originalTransaction = null }) {
  const [form, setForm] = useState({
    amount: "",
    type: "income",
    category: "",
    date: "",
    note: "",
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [isProceeding, setIsProceeding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showError, showSuccess } = useNotification();

  // Load categories on component mount
  useEffect(() => {
    const cats = loadCategories();
    setCategories(cats);
  }, []);

  // Populate form when transaction changes
  useEffect(() => {
    if (transaction) {
      setForm({
        amount: transaction.amount || "",
        type: transaction.type || "income",
        category: transaction.category || "",
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : "",
        note: transaction.note || "",
      });
    }
  }, [transaction]);

  // Process categories for display (same logic as TransactionForm)
  const displayCategories = useMemo(() => {
    const withoutOther = categories.filter((c) => c.toLowerCase() !== "other");
    const hasOther = categories.some((c) => c.toLowerCase() === "other");
    return hasOther ? [...withoutOther, "Other"] : withoutOther;
  }, [categories]);

  // Handle animation when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if only amount has changed for expense transactions
    if (form.type === "expense") {
      const newExpenseAmount = Number(form.amount);
      const originalAmount = originalTransaction ? Number(originalTransaction.amount) : 0;
      const originalType = originalTransaction ? originalTransaction.type : "income";
      
      // Only show warning if amount has actually changed
      const amountChanged = newExpenseAmount !== originalAmount;
      
      if (amountChanged) {
        // Calculate the net change in balance
        let netChange = 0;
        if (originalType === "income") {
          // Was income, now expense: we lose the original income AND spend the new amount
          netChange = originalAmount + newExpenseAmount;
        } else {
          // Was expense, now expense: we only pay the difference
          netChange = newExpenseAmount - originalAmount;
        }
        
        // Check if the net change would exceed available balance
        if (netChange > currentBalance) {
          // Show warning dialog instead of blocking
          setPendingFormData({ ...form, netChange, originalAmount, originalType, newExpenseAmount });
          setShowBalanceWarning(true);
          return;
        }
      }
    }
    
    // Proceed with update if no warning needed
    await submitUpdate(form);
  };

  const submitUpdate = async (formData) => {
    try {
      setIsSaving(true);
      await onSave(transaction._id, formData);
      onClose();
      showSuccess("Transaction updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      showError("Failed to update transaction");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmUpdate = async () => {
    setIsProceeding(true);
    setShowBalanceWarning(false);
    await submitUpdate(pendingFormData);
    setPendingFormData(null);
    setIsProceeding(false);
  };

  const handleCancelUpdate = () => {
    setShowBalanceWarning(false);
    setPendingFormData(null);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 ease-in-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Transaction</h2>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Balance:</span>
            <span className={`ml-1 font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{currentBalance.toLocaleString()}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full p-2 border rounded appearance-none pr-8"
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
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <div className="relative">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-2 border rounded cursor-pointer appearance-none pr-8"
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
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Note</label>
            <input
              name="note"
              type="text"
              value={form.note}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`flex-1 text-white p-2 rounded transition-colors ${
                isSaving 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Balance Warning Dialog */}
      <AnimatePresence>
        {showBalanceWarning && pendingFormData && (
          <motion.div 
            className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-60 p-2 sm:p-4"
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
                This change would require
                <span
                  className="font-semibold text-red-600"
                  style={{ paddingLeft: "5px", paddingRight: "5px" }}
                >
                  ₹{pendingFormData.netChange.toLocaleString()}
                </span>
                but you only have <span className="font-semibold text-green-600">₹{currentBalance.toLocaleString()}</span> available.
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {pendingFormData.originalType === "income" 
                  ? `You'll lose ₹${pendingFormData.originalAmount.toLocaleString()} income and spend ₹${pendingFormData.newExpenseAmount.toLocaleString()}`
                  : `Expense will increase by ₹${pendingFormData.netChange.toLocaleString()} (from ₹${pendingFormData.originalAmount.toLocaleString()} to ₹${pendingFormData.newExpenseAmount.toLocaleString()})`
                }
              </p>
            </div>
            
            <div className="flex gap-2 sm:gap-3">
              <motion.button
                onClick={handleCancelUpdate}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm rounded transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleConfirmUpdate}
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
    </div>
  );
}
