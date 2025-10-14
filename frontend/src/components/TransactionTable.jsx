
import { useState } from "react";
import { formatDateToIST } from "../utils/api";
import LoadingAnimation from "./LoadingAnimation";
import { FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function TransactionTable({ transactions, onEdit, onDelete, isLoading = false }) {
  const [filter, setFilter] = useState("all");

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
          <h2 className="text-xl font-semibold">Transactions</h2>
        </div>
        <LoadingAnimation message="Loading data" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <div className="relative w-full sm:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 pr-8 text-sm w-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          {/* Down Arrow Icon */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg 
              className="w-4 h-4 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2 text-left">Category</th>
              <th className="border border-gray-300 p-2 text-left">Amount</th>
              <th className="border border-gray-300 p-2 text-left">Type</th>
              <th className="border border-gray-300 p-2 text-left">Date</th>
              <th className="border border-gray-300 p-2 text-left">Note</th>
              <th className="border border-gray-300 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 max-w-32 truncate" title={tx.category}>
                    {tx.category}
                  </td>
                  <td
                    className={`border border-gray-300 p-2 ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{tx.amount}
                  </td>
                  <td className="border border-gray-300 p-2 capitalize">
                    {tx.type}
                  </td>
                  <td className="border border-gray-300 p-2">{formatDateToIST(tx.date)}</td>
                  <td className="border border-gray-300 p-2 max-w-32 truncate" title={tx.note || ""}>
                    {tx.note || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit && onEdit(tx)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(tx._id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center border border-gray-300 p-4 text-gray-500"
                >
                  {filter === "all" ? "No transactions yet" : `No ${filter} transactions found`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2 sm:space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div 
              key={tx._id} 
              className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md border border-gray-100"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm ${
                  tx.type === 'income' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                }`}>
                  {tx.type === 'income' ? (
                    <FiTrendingUp size={16} className="sm:hidden" />
                  ) : (
                    <FiTrendingDown size={16} className="sm:hidden" />
                  )}
                  {tx.type === 'income' ? (
                    <FiTrendingUp size={20} className="hidden sm:inline" />
                  ) : (
                    <FiTrendingDown size={20} className="hidden sm:inline" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{tx.category}</p>
                  <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
                      tx.type === 'income' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.type}
                    </span>
                  </div>
                  {tx.note && (
                    <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5 sm:mt-1">
                      {tx.note}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Amount and Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                  <p className={`font-bold text-base sm:text-lg ${
                    tx.type === 'income' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                  </p>
                </div>
                
                {/* Vertical Action Buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => onEdit && onEdit(tx)}
                    className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(tx._id)}
                    className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 text-gray-500 bg-white border border-gray-300 rounded-lg">
            {filter === "all" ? "No transactions yet" : `No ${filter} transactions found`}
          </div>
        )}
      </div>
    </div>
  );
}

