
import { useState } from "react";

export default function TransactionTable({ transactions, onEdit, onDelete }) {
  const [filter, setFilter] = useState("all");

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm w-full sm:w-auto"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
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
                  <td className="border border-gray-300 p-2">{tx.category}</td>
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
                  <td className="border border-gray-300 p-2">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="border border-gray-300 p-2 max-w-xs truncate" title={tx.note || ""}>
                    {tx.note || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit && onEdit(tx)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(tx._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors cursor-pointer"
                      >
                        Delete
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
      <div className="md:hidden space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <div key={tx._id} className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{tx.category}</h3>
                <span
                  className={`font-bold text-lg ${
                    tx.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ₹{tx.amount}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  tx.type === "income" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }`}>
                  {tx.type}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(tx.date).toLocaleDateString()}
                </span>
              </div>
              
              {tx.note && (
                <p className="text-sm text-gray-600 mb-3">{tx.note}</p>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit && onEdit(tx)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete && onDelete(tx._id)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition-colors cursor-pointer"
                >
                  Delete
                </button>
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

