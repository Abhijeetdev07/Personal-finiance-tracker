import { useState, useRef, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ transactions, showFilter = true }) {
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get unique months from transactions
  const getAvailableMonths = () => {
    const months = new Set();
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.add(month);
    });
    return Array.from(months).sort().map((monthKey) => {
      const [year, month] = monthKey.split('-');
      const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      return { value: monthKey, label: monthName };
    });
  };

  // Filter transactions based on selected month
  const filteredTransactions = selectedMonth === "all" 
    ? transactions 
    : transactions.filter((t) => {
        const d = new Date(t.date);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return month === selectedMonth;
      });
  
  // Process data for pie chart
  const byCategory = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const key = t.category || "Other";
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    }, {});

  const labels = Object.keys(byCategory);
  const values = Object.values(byCategory);
  
  // Truncate long category names
  const truncatedLabels = labels.map(label => 
    label.length > 15 ? label.substring(0, 15) + '...' : label
  );

  const colors = [
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#f59e0b",
    "#a78bfa",
    "#f87171",
    "#10b981",
    "#22d3ee",
    "#00ff00",
  ];

  const data = {
    labels: truncatedLabels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const originalLabel = labels[context.dataIndex];
            // Truncate for tooltip display
            const truncatedTooltipLabel = originalLabel.length > 15 ? originalLabel.substring(0, 15) + '...' : originalLabel;
            const value = context.parsed;
            return `${truncatedTooltipLabel}: ₹${value}`;
          }
        }
      }
    },
  };

  // Custom dropdown component
  const CustomDropdown = () => {
    const months = getAvailableMonths();
    const selectedMonthLabel = selectedMonth === "all" ? "All Time" : 
      months.find(m => m.value === selectedMonth)?.label || "All Time";

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="border border-gray-300 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm w-full sm:w-auto bg-white text-left flex justify-between items-center"
        >
          <span>{selectedMonthLabel}</span>
          <span className="ml-2">▼</span>
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-full left-0 sm:right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-32 overflow-y-auto w-full sm:min-w-full">
            <button
              type="button"
              onClick={() => {
                setSelectedMonth("all");
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                selectedMonth === "all" ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              All Time
            </button>
            {months.map((month) => (
              <button
                key={month.value}
                type="button"
                onClick={() => {
                  setSelectedMonth(month.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                  selectedMonth === month.value ? "bg-blue-100 text-blue-800" : ""
                }`}
              >
                {month.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (labels.length === 0) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2 sm:gap-3">
          <h3 className="font-semibold text-sm sm:text-base">Spending by Category</h3>
          {showFilter && <CustomDropdown />}
        </div>
        <div className="text-gray-500 text-xs sm:text-sm text-center py-6 sm:py-8 border rounded bg-white">
          No data to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2 sm:gap-3">
        <h3 className="font-semibold text-sm sm:text-base">Spending by Category</h3>
        {showFilter && <CustomDropdown />}
      </div>
      <div className="h-48 sm:h-72">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}


