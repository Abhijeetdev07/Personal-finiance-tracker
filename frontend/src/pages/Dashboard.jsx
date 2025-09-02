import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

export default function Dashboard() {
  const { token, logoutUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch transactions");
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Add transaction
  const handleAdd = tx => setTransactions([tx, ...transactions]);

  // Delete transaction
  const handleDelete = async id => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      setTransactions(transactions.filter(tx => tx._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-smoky p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <button onClick={logoutUser} className="bg-primary text-white px-4 py-2 rounded hover:opacity-90">
          Logout
        </button>
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <TransactionForm onAdd={handleAdd} />
      <TransactionList transactions={transactions} onDelete={handleDelete} />
    </div>
  );
}
