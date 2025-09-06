
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext as AppAuthContext } from "../App";
import { apiFetch } from "../utils/api";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import EditTransactionModal from "../components/EditTransactionModal";
import CategoryPieChart from "../components/CategoryPieChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import ProfileCard from "../components/ProfileCard";
import ProfileEditModal from "../components/ProfileEditModal";
import { AuthProvider as ProfileAuthProvider, AuthContext as ProfileContext } from "../context/AuthContext";

export default function Dashboard() {
  const { token, logout } = useContext(AppAuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Check if user still exists and fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await apiFetch("/transactions");
        const data = await res.json();

        if (!res.ok) {
          // If user is deleted (401 or 404), logout and redirect to register
          if (res.status === 401 || res.status === 404) {
            logout();
            navigate("/register");
            return;
          }
          throw new Error(data.error || "Failed to fetch");
        }

        setTransactions(data);

        // Calculate summary
        let income = 0, expense = 0;
        data.forEach((tx) =>
          tx.type === "income" ? (income += tx.amount) : (expense += tx.amount)
        );
        setSummary({ income, expense, balance: income - expense });
      } catch (err) {
        console.error("Fetch error:", err);
        // If it's an unauthorized error, logout and redirect
        if (err.message === "Unauthorized") {
          logout();
          navigate("/register");
        }
      }
    };

    fetchTransactions();
  }, [token, logout, navigate]);

  // Delete transaction
  const deleteTransaction = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;
    try {
      const res = await apiFetch(`/transactions/${id}`, { method: "DELETE" });
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
      const res = await apiFetch(`/transactions/${id}`, {
        method: "PUT",
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
    <ProfileAuthProvider>
    <div className="min-h-screen bg-gray-50">
      <div className="w-full bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <HeaderProfile
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onLogout={logout}
            isMenuOpen={isProfileMenuOpen}
            setIsMenuOpen={setIsProfileMenuOpen}
            menuRef={menuRef}
          />
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-4xl mx-auto">
            <div className="bg-green-100 p-2 sm:px-6 sm:py-4 rounded-lg shadow">
              <h2 className="text-xs sm:text-lg font-semibold text-green-800">Income</h2>
              <p className="text-xs sm:text-xl text-green-700 truncate">₹{summary.income}</p>
            </div>
            <div className="bg-red-100 p-2 sm:px-6 sm:py-4 rounded-lg shadow">
              <h2 className="text-xs sm:text-lg font-semibold text-red-800">Expenses</h2>
              <p className="text-xs sm:text-xl text-red-700 truncate">₹{summary.expense}</p>
            </div>
            <div className="bg-blue-100 p-2 sm:px-6 sm:py-4 rounded-lg shadow">
              <h2 className="text-xs sm:text-lg font-semibold text-blue-800">Balance</h2>
              <p className="text-xs sm:text-xl text-blue-700 truncate">₹{summary.balance}</p>
            </div>
          </div>
        </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CategoryPieChart transactions={transactions} />
        <MonthlyBarChart transactions={transactions} />
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

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
      </div>
    </div>
    </ProfileAuthProvider>
  );
}

function HeaderProfile({ onOpenProfile, onLogout, isMenuOpen, setIsMenuOpen, menuRef }) {
  const { profile } = useContext(ProfileContext) || {};

  const avatarContent = (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
      {(profile?.firstName?.[0] || profile?.username?.[0] || "U").toUpperCase()}
    </div>
  );

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 focus:outline-none"
        >
          {avatarContent}
          <span className="hidden sm:block text-sm text-gray-800">
            {profile?.firstName || profile?.username || "Profile"}
          </span>
        </button>
      </div>
      {isMenuOpen && (
        <div className="absolute right-0 mt-3 w-64 sm:w-80 bg-white border rounded-lg shadow-lg p-3 z-20">
          <ProfileCard />
          <div className="flex flex-wrap justify-end gap-2 mt-3">
            <button
              onClick={() => { setIsMenuOpen(false); onOpenProfile(); }}
              className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
            >
              Edit Profile
            </button>
            <button
              onClick={() => { setIsMenuOpen(false); onLogout(); }}
              className="px-2 py-1 sm:px-3 sm:py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




