
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
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Transactions</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Category</th>
            <th className="border border-gray-300 p-2">Amount</th>
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Note</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => (
              <tr key={tx._id}>
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
                <td className="border border-gray-300 p-2">{tx.note || "-"}</td>
                <td className="border border-gray-300 p-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit && onEdit(tx)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(tx._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
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
  );
}

