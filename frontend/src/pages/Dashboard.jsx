
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../App";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import EditTransactionModal from "../components/EditTransactionModal";

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch");

        setTransactions(data);

        // Calculate summary
        let income = 0, expense = 0;
        data.forEach((tx) =>
          tx.type === "income" ? (income += tx.amount) : (expense += tx.amount)
        );
        setSummary({ income, expense, balance: income - expense });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchTransactions();
  }, [token]);

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Edit transaction
  const editTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Update transaction
  const updateTransaction = async (id, updatedData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to update transaction");

      const updatedTx = await res.json();
      setTransactions((prev) =>
        prev.map((tx) => (tx._id === id ? updatedTx : tx))
      );

      // Recalculate summary
      const updatedTransactions = transactions.map((tx) =>
        tx._id === id ? updatedTx : tx
      );
      let income = 0, expense = 0;
      updatedTransactions.forEach((tx) =>
        tx.type === "income" ? (income += tx.amount) : (expense += tx.amount)
      );
      setSummary({ income, expense, balance: income - expense });
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-green-800">Income</h2>
            <p className="text-xl text-green-700">₹{summary.income}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-red-800">Expenses</h2>
            <p className="text-xl text-red-700">₹{summary.expense}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-blue-800">Balance</h2>
            <p className="text-xl text-blue-700">₹{summary.balance}</p>
          </div>
        </div>

      {/* Add Transaction Form */}
      <TransactionForm token={token} onAdd={setTransactions} />

      {/* Transaction Table */}
      <TransactionTable 
        transactions={transactions} 
        onEdit={editTransaction}
        onDelete={deleteTransaction}
      />

      {/* Edit Modal */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={updateTransaction}
      />
      </div>
    </div>
  );
}




