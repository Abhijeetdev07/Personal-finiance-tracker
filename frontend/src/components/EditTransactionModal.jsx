import { useState, useEffect, useMemo } from "react";
import { formatDateToIST } from "../utils/api";
import { loadCategories } from "../utils/categories";

export default function EditTransactionModal({ transaction, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: "",
    type: "income",
    category: "",
    date: "",
    note: "",
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [categories, setCategories] = useState([]);

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
    try {
      await onSave(transaction._id, form);
      onClose();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white bg-opacity-95 backdrop-blur-sm p-6 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-300 ease-in-out ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
        
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
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 border rounded cursor-pointer"
              required
            >
              {displayCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              {displayCategories.length === 0 && <option value="" disabled>No categories</option>}
            </select>
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
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
