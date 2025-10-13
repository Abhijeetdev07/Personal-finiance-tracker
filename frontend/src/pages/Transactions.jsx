import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext as AppAuthContext } from "../App";
import { apiFetch } from "../utils/api";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import EditTransactionModal from "../components/EditTransactionModal";
import ConfirmModal from "../components/ConfirmModal";
import ExportModal from "../components/ExportModal";
import { useNotification } from "../context/NotificationContext";
import { FiArrowLeft, FiPlus, FiTrendingUp, FiTrendingDown, FiDownload } from "react-icons/fi";

export default function Transactions() {
  const { token, logout } = useContext(AppAuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportInProgress, setIsExportInProgress] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch("/transactions");
        const data = await res.json();

        if (!res.ok) {
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
        data.forEach((tx) => {
          const amount = Number(tx.amount) || 0;
          tx.type === "income" ? (income += amount) : (expense += amount);
        });
        setSummary({ income, expense, balance: income - expense });
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.message === "Unauthorized") {
          logout();
          navigate("/register");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [token, logout, navigate]);

  // Show delete confirmation modal
  const showDeleteConfirmation = (id) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Delete transaction
  const deleteTransaction = async () => {
    if (!transactionToDelete) return;
    try {
      const transactionToDeleteData = transactions.find(t => t._id === transactionToDelete);
      
      const res = await apiFetch(`/transactions/${transactionToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
      
      if (transactionToDeleteData) {
        showSuccess(`Deleted: ${transactionToDeleteData.type === 'income' ? '+' : '-'}₹${transactionToDeleteData.amount} (${transactionToDeleteData.category})`);
      } else {
        showSuccess("Transaction deleted");
      }
      
      setTransactions((prev) => prev.filter((t) => t._id !== transactionToDelete));
      
      // Recalculate summary after deletion
      const updatedTransactions = transactions.filter((t) => t._id !== transactionToDelete);
      let income = 0, expense = 0;
      updatedTransactions.forEach((tx) => {
        const amount = Number(tx.amount) || 0;
        tx.type === "income" ? (income += amount) : (expense += amount);
      });
      setSummary({ income, expense, balance: income - expense });
    } catch (err) {
      console.error("Delete error:", err);
      showError("Failed to delete transaction");
    }
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTransactionToDelete(null);
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
      
      showSuccess(`Updated: ${updatedTx.type === 'income' ? '+' : '-'}₹${updatedTx.amount} (${updatedTx.category})`);
      
      setTransactions((prev) =>
        prev.map((tx) => (tx._id === id ? updatedTx : tx))
      );

      // Recalculate summary
      const updatedTransactions = transactions.map((tx) =>
        tx._id === id ? updatedTx : tx
      );
      let income = 0, expense = 0;
      updatedTransactions.forEach((tx) => {
        const amount = Number(tx.amount) || 0;
        tx.type === "income" ? (income += amount) : (expense += amount);
      });
      setSummary({ income, expense, balance: income - expense });
    } catch (err) {
      console.error("Update error:", err);
      showError("Failed to update transaction");
      throw err;
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  // Handle new transaction added
  const handleTransactionAdded = (newTransaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Recalculate summary
    const amount = Number(newTransaction.amount) || 0;
    setSummary(prev => ({
      income: newTransaction.type === 'income' ? prev.income + amount : prev.income,
      expense: newTransaction.type === 'expense' ? prev.expense + amount : prev.expense,
      balance: newTransaction.type === 'income' ? prev.balance + amount : prev.balance - amount
    }));
    
    setShowAddForm(false);
    showSuccess(`Added: ${newTransaction.type === 'income' ? '+' : '-'}₹${newTransaction.amount} (${newTransaction.category})`);
  };

  // Handle export completion
  const handleExportComplete = (result) => {
    setIsExportInProgress(false);
    
    if (result.success) {
      showSuccess(`Successfully exported ${result.summary?.totalTransactions || 0} transactions to PDF`);
    } else {
      showError(result.error || 'Export failed. Please try again.');
    }
  };

  // Handle export start
  const handleExportStart = () => {
    setIsExportInProgress(true);
    setIsExportModalOpen(true);
  };

  // Handle export modal close
  const handleExportModalClose = () => {
    setIsExportModalOpen(false);
    setIsExportInProgress(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <div className="w-full fixed top-0 z-20 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4 border-b border-gray-200 shadow-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 px-3 py-2 rounded-lg"
            >
              <FiArrowLeft size={20} />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Transactions</h1>
              <p className="text-sm text-gray-500 hidden sm:block">Manage your financial records</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Export PDF Button - Hidden on mobile, shown on desktop */}
            <button
              onClick={handleExportStart}
              disabled={transactions.length === 0 || isExportInProgress}
              className={`hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-white ${
                isExportInProgress
                  ? 'bg-blue-600 cursor-wait'
                  : transactions.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
              title={
                transactions.length === 0 
                  ? 'No transactions to export' 
                  : isExportInProgress 
                  ? 'Export in progress...' 
                  : 'Export transactions to PDF'
              }
            >
              {isExportInProgress ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <FiDownload size={18} />
                  </motion.div>
                  <span className="hidden lg:inline">Exporting...</span>
                </>
              ) : (
                <>
                  <FiDownload size={18} />
                  <span className="hidden lg:inline">Export PDF</span>
                </>
              )}
            </button>
            
            {/* Add Transaction Button */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                showAddForm 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
              }`}
            >
              <FiPlus size={18} className={showAddForm ? 'rotate-45' : ''} style={{ transition: 'transform 0.2s' }} />
              <span className="hidden sm:inline">{showAddForm ? 'Cancel' : 'Add Transaction'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Summary Cards */}
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-medium text-green-100">Total Income</h2>
                    <p className="text-sm sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">₹{summary.income.toLocaleString()}</p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 bg-white/20 rounded-lg items-center justify-center">
                    <FiTrendingUp size={24} />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-medium text-red-100">Total Expenses</h2>
                    <p className="text-sm sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">₹{summary.expense.toLocaleString()}</p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 bg-white/20 rounded-lg items-center justify-center">
                    <FiTrendingDown size={24} />
                  </div>
                </div>
              </div>
              
              <div className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} p-3 sm:p-6 rounded-lg sm:rounded-xl shadow-lg text-white transform hover:scale-105 transition-all duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs sm:text-sm font-medium text-white/80">Net Balance</h2>
                    <p className="text-sm sm:text-2xl lg:text-3xl font-bold mt-0.5 sm:mt-1">₹{summary.balance.toLocaleString()}</p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 bg-white/20 rounded-lg items-center justify-center">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Add Transaction Form */}
          {showAddForm && (
            <div className="mb-8 animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Add New Transaction</h2>
                    <p className="text-sm text-gray-500 mt-1">Record your income or expense</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <TransactionForm 
                  token={token} 
                  onAdd={handleTransactionAdded}
                  currentBalance={summary.balance}
                />
              </div>
            </div>
          )}

          {/* Enhanced Transaction Table */}
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {transactions.length} {transactions.length === 1 ? 'transaction' : 'transactions'} total
                  </p>
                </div>
                {!showAddForm && transactions.length > 0 && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg"
                  >
                    <FiPlus size={16} />
                    <span>Quick Add</span>
                  </button>
                )}
              </div>
              <TransactionTable 
                transactions={transactions} 
                onEdit={editTransaction}
                onDelete={showDeleteConfirmation}
                isLoading={isLoading}
              />
              
              {/* Export PDF Button at bottom right - Visible on mobile, optional on desktop */}
              {transactions.length > 0 && (
                <div className="flex justify-end mt-6 border-t pt-6">
                  <button
                    onClick={handleExportStart}
                    disabled={isExportInProgress}
                    className={`flex sm:hidden items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 text-white ${
                      isExportInProgress
                        ? 'bg-blue-600 cursor-wait'
                        : 'bg-green-600 hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
                    }`}
                    title={
                      isExportInProgress 
                        ? 'Export in progress...' 
                        : 'Export transactions to PDF'
                    }
                  >
                    {isExportInProgress ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <FiDownload size={18} />
                        </motion.div>
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload size={18} />
                        <span>Export PDF</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={updateTransaction}
        currentBalance={summary.balance}
        originalTransaction={editingTransaction}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={deleteTransaction}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-500 hover:bg-red-600"
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={handleExportModalClose}
        transactions={transactions}
        onExportComplete={handleExportComplete}
      />
    </div>
  );
}
