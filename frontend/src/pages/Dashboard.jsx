import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../App";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  // Fetch all transactions
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

  // Add new transaction
  const addTransaction = async (transaction) => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(transaction),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add transaction");
      setTransactions((prev) => [...prev, data]);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a transaction
  const deleteTransaction = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete transaction");
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    // <div className="min-h-screen bg-smoky">
    //   <div className=" shadow-md w-full p-3 mb-5">
    //       <div className="flex justify-between items-center px-4">
    //           <h1 className="text-3xl font-bold text-primary mb-2">Dashboard</h1>
    //            <button
    //             onClick={logout}
    //             className="bg-red-500 text-white px-4 py-2 rounded-lg mb-2"
    //            >
    //          Logout
    //         </button>
    //     </div>
    //   </div>

    //   {error && <p className="text-red-600 mb-3">{error}</p>}

    //   <TransactionForm onAdd={addTransaction} />
    //   <TransactionList transactions={transactions} onDelete={deleteTransaction} />
    // </div>

    <div className="min-h-screen bg-smoky">
  {/* Sticky Navbar */}
  <div className="shadow-md w-full p-3 fixed top-0 bg-white z-50">
    <div className="flex justify-between items-center px-4 flex-wrap">
      <h1 className="text-3xl font-bold text-primary mb-2 sm:mb-0">
        Dashboard
      </h1>
      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mb-2 sm:mb-0 transition-colors"
      >
        Logout
      </button>
    </div>
  </div>

  {/* Error Message */}
  {error && <p className="text-red-600 mb-3 px-4 pt-24">{error}</p>}

  {/* Content */}
  <div className="flex flex-col xl:flex-row justify-center gap-6 px-4 sm:px-6 md:px-10 pt-24">
    <TransactionForm onAdd={addTransaction} />

    <TransactionList
      transactions={transactions}
      onDelete={deleteTransaction}
    />
  </div>
</div>




  );
}






