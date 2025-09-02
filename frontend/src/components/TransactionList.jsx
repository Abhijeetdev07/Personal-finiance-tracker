export default function TransactionList({ transactions, onDelete }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl">
        <h2 className="text-xl font-bold text-primary mb-4">Transactions</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">Date</th>
              <th className="border-b p-2">Type</th>
              <th className="border-b p-2">Category</th>
              <th className="border-b p-2">Amount</th>
              <th className="border-b p-2">Note</th>
              <th className="border-b p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx._id} className="hover:bg-gray-100">
                <td className="p-2">{new Date(tx.date).toLocaleDateString()}</td>
                <td className={`p-2 font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {tx.type}
                </td>
                <td className="p-2">{tx.category}</td>
                <td className="p-2">{tx.amount}</td>
                <td className="p-2">{tx.note}</td>
                <td className="p-2">
                  <button
                    onClick={() => onDelete(tx._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No transactions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
  