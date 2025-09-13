
import { useState, useEffect, useMemo } from "react";
import { apiFetch } from "../utils/api";
import { loadCategories } from "../utils/categories";
import { toast } from "react-toastify";

export default function TransactionForm({ token, onAdd }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cats = loadCategories();
    setCategories(cats);
    if (!category && cats.length > 0) {
      setCategory(cats[0]);
    }
  }, []);

  const displayCategories = useMemo(() => {
    const withoutOther = categories.filter((c) => c.toLowerCase() !== "other");
    const hasOther = categories.some((c) => c.toLowerCase() === "other");
    return hasOther ? [...withoutOther, "Other"] : withoutOther;
  }, [categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await apiFetch("/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          type,
          category,
          date,
          note,
        }),
      });

      const newTx = await res.json();
      if (!res.ok) throw new Error(newTx.error || "Failed to add");

      // Show success toast
      toast.success(`Added: ${type === 'income' ? '+' : '-'}$${amount} (${category})`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update parent list
      onAdd((prev) => [...prev, newTx]);

      // Reset form
      setAmount("");
      setType("income");
      setCategory(categories[0] || "");
      setDate("");
      setNote("");
    } catch (err) {
      console.error("Add error:", err);
      toast.error("Failed to add transaction", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Add Transaction</h2>
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
          placeholder="Date"
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
  );
}
