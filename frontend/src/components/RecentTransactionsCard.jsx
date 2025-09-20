import { Link } from "react-router-dom";
import { FiArrowRight, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import LoadingAnimation from "./LoadingAnimation";

export default function RecentTransactionsCard({ transactions, isLoading }) {
  // Get the last 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Loading your latest activity...</p>
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Transactions</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Your latest financial activity</p>
          </div>
          <Link 
            to="/transactions" 
            className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-lg w-fit"
          >
            Get Started <FiArrowRight size={12} className="sm:hidden" /><FiArrowRight size={16} className="hidden sm:inline" />
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiTrendingUp size={32} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start tracking your income and expenses to get insights into your financial habits.</p>
          <Link 
            to="/transactions" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            Add Your First Transaction <FiArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Transactions</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Your latest financial activity</p>
        </div>
        <Link 
          to="/transactions" 
          className="flex items-center justify-center gap-1 sm:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-lg w-fit"
        >
          <span className="sm:hidden">View All</span>
          <span className="hidden sm:inline">View All ({transactions.length})</span>
          <FiArrowRight size={12} className="sm:hidden" />
          <FiArrowRight size={16} className="hidden sm:inline" />
        </Link>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {recentTransactions.map((transaction, index) => (
          <div 
            key={transaction._id} 
            className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-md border border-gray-100"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm ${
                transaction.type === 'income' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
              }`}>
                {transaction.type === 'income' ? (
                  <FiTrendingUp size={16} className="sm:hidden" />
                ) : (
                  <FiTrendingDown size={16} className="sm:hidden" />
                )}
                {transaction.type === 'income' ? (
                  <FiTrendingUp size={20} className="hidden sm:inline" />
                ) : (
                  <FiTrendingDown size={20} className="hidden sm:inline" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{transaction.category}</p>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type}
                  </span>
                </div>
                {transaction.note && (
                  <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5 sm:mt-1">
                    {transaction.note}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`font-bold text-base sm:text-lg ${
                transaction.type === 'income' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {transactions.length > 5 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link 
            to="/transactions" 
            className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium border-2 border-dashed border-blue-200 hover:border-blue-300"
          >
            View {transactions.length - 5} More Transactions <FiArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
