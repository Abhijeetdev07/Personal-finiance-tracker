import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function TransactionForm({ onAdd }) {
  const { token } = useContext(AuthContext);
  const [form, setForm] = useState({
    amount: "",
    type: "income",
    category: "",
    date: "",
    note: "",
  });
  const [error, setError] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add transaction");

      onAdd(data); // update parent Dashboard
      setForm({ amount: "", type: "income", category: "", date: "", note: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md mb-6 w-full max-w-md">
      <h2 className="text-xl font-bold text-primary mb-4">Add Transaction</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <input
        name="amount"
        type="number"
        placeholder="Amount"
        value={form.amount}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      />
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      <input
        name="category"
        placeholder="Category"
        value={form.category}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      />
      <input
        name="note"
        placeholder="Note"
        value={form.note}
        onChange={handleChange}
        className="w-full p-2 mb-2 border rounded"
      />
      <button type="submit" className="w-full bg-primary text-white p-2 rounded mt-2 hover:opacity-90">
        Add Transaction
      </button>
    </form>
  );
}
