
import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { AuthContext as AppAuthContext } from "../App";
import { apiFetch } from "../utils/api";
import CategoryPieChart from "../components/CategoryPieChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import ProfileEditModal from "../components/ProfileEditModal";
import ProfileSidebar from "../components/ProfileSidebar";
import { AuthProvider as ProfileAuthProvider, AuthContext as ProfileContext } from "../context/AuthContext";
import RecentTransactionsCard from "../components/RecentTransactionsCard";

export default function Dashboard() {
  const { token, logout } = useContext(AppAuthContext);
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);


  // Fetch transactions for summary and charts
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


  return (
    <ProfileAuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Enhanced Header */}
        <div className="w-full fixed top-0 z-20 bg-white/95 backdrop-blur-sm px-4 sm:px-6 py-4 border-b border-gray-200 shadow-lg">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Hide Add Transaction button on mobile, show on desktop */}
              <Link
                to="/transactions"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                <FiPlus size={18} />
                <span>Add Transaction</span>
              </Link>
              
              <HeaderProfile
                onOpenProfile={() => setIsProfileSidebarOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
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
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
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
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
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

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <CategoryPieChart transactions={transactions} isLoading={isLoading} />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                <MonthlyBarChart transactions={transactions} isLoading={isLoading} />
              </div>
            </div>

            {/* Enhanced Recent Transactions */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
              <RecentTransactionsCard 
                transactions={transactions} 
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

        {/* Profile Sidebar */}
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          onClose={() => setIsProfileSidebarOpen(false)}
          onLogout={logout}
        />

        {/* Fixed Floating Action Button for Mobile */}
        <Link
          to="/transactions"
          className="sm:hidden fixed bottom-6 right-6 z-30 flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 animate-pulse-slow"
          aria-label="Add Transaction"
        >
          <FiPlus size={24} />
        </Link>
      </div>
    </ProfileAuthProvider>
  );
}

function HeaderProfile({ onOpenProfile }) {
  const { profile } = useContext(ProfileContext) || {};

  const avatarContent = (
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold hover:bg-gray-300 transition-all duration-200">
      {(profile?.firstName?.[0] || profile?.username?.[0] || "U").toUpperCase()}
    </div>
  );

  return (
    <button
      onClick={onOpenProfile}
      className="flex items-center gap-2 focus:outline-none hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors"
      title="Open Profile"
    >
      {avatarContent}
      <span className="hidden sm:block text-sm text-gray-800 font-medium">
        {profile?.firstName || profile?.username || "Profile"}
      </span>
    </button>
  );
}




