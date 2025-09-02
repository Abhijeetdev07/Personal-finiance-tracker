
import { useState } from "react";

export default function TransactionForm({ token, onAdd }) {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

      // Update parent list
      onAdd((prev) => [...prev, newTx]);

      // Reset form
      setAmount("");
      setType("income");
      setCategory("");
      setDate("");
      setNote("");
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-gray-100 p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-3">Add Transaction</h2>
      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded w-1/3"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded w-1/3"
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-1/3"
          required
        />
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded w-1/3"
          required
        />
        <input
          type="text"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </form>
  );
}
