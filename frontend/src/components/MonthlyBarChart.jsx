import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import LoadingAnimation from "./LoadingAnimation";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function MonthlyBarChart({ transactions, showWrapper = true, isLoading = false }) {
  const [filter, setFilter] = useState("all"); // "all", "income", "expense"
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  // Process transactions for monthly data
  const toMonth = (iso) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  
  const monthlyIncome = {};
  const monthlyExpense = {};
  
  transactions.forEach((t) => {
    const m = toMonth(t.date);
    if (t.type === "income") monthlyIncome[m] = (monthlyIncome[m] || 0) + t.amount;
    else monthlyExpense[m] = (monthlyExpense[m] || 0) + t.amount;
  });

  const labels = Object.keys({ ...monthlyIncome, ...monthlyExpense }).sort();

  // Generate datasets based on filter
  const getDatasets = () => {
    const datasets = [];
    
    if (filter === "all" || filter === "income") {
      datasets.push({
        label: "Income",
        data: labels.map((m) => monthlyIncome[m] || 0),
        backgroundColor: "#34d399",
        borderColor: "#10b981",
        borderWidth: 1,
        borderRadius: 6,
      });
      // Income trend line overlay (green)
      datasets.push({
        type: "line",
        label: "Income Trend",
        parsing: false,
        // shift points slightly left to align with the left bar in the group
        data: labels.map((_, i) => ({ x: i - 0.2, y: (monthlyIncome[labels[i]] || 0) })),
        borderColor: "#22c55e", // green-500
        backgroundColor: "rgba(34, 197, 94, 0.76)",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        xAxisID: "x",
        order: 3,
      });
    }
    
    if (filter === "all" || filter === "expense") {
      datasets.push({
        label: "Expense",
        data: labels.map((m) => monthlyExpense[m] || 0),
        backgroundColor: "#f87171",
        borderColor: "#ef4444",
        borderWidth: 1,
        borderRadius: 6,
      });
    }
    
    // Expense trend line overlay (red)
    datasets.push({
      type: "line",
      label: "Expense Trend",
      parsing: false,
      // shift points slightly right to align with the right bar in the group
      data: labels.map((_, i) => ({ x: i + 0.2, y: (monthlyExpense[labels[i]] || 0) })),
      borderColor: "#ef4444", // red-500
      backgroundColor: "rgba(239, 68, 68, 0.15)",
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      xAxisID: "x",
      order: 3,
    });
    
    return datasets;
  };

  const data = {
    labels,
    datasets: getDatasets(),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          // Use small circular markers and smaller font on mobile
          usePointStyle: isMobile,
          boxWidth: isMobile ? 18 : 24,
          boxHeight: isMobile ? 10 : 12,
          padding: isMobile ? 10 : 16,
          font: { size: isMobile ? 10 : 12 },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: isMobile ? 10 : 12 } },
        // Align line points with the visual center of the grouped bars
        offset: true,
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: isMobile ? 10 : 12 } },
      },
    },
  };

  // Filter dropdown component
  const FilterDropdown = () => (
    <div className="relative">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-20 sm:w-24 px-3 py-1 pr-8 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 cursor-pointer appearance-none"
      >
        <option value="all">All</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
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
  );

  if (isLoading) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <h3 className="font-semibold text-sm sm:text-base">Monthly Trend</h3>
          <FilterDropdown />
        </div>
        <LoadingAnimation message="Loading data" />
      </div>
    );
  }

  if (labels.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Monthly Trend</h3>
          <FilterDropdown />
        </div>
        <div className="text-gray-500 text-sm text-center py-8 border rounded bg-white">
          No data to display
        </div>
      </div>
    );
  }

  if (!showWrapper) {
    return (
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm sm:text-base">Monthly Trend</h3>
          <FilterDropdown />
        </div>
        <div className="h-48 sm:h-72">
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <h3 className="font-semibold text-sm sm:text-base">Monthly Trend</h3>
        <FilterDropdown />
      </div>
      <div className="h-48 sm:h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}


