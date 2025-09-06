import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function MonthlyBarChart({ transactions, showWrapper = true }) {
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

  const data = {
    labels,
    datasets: [
      {
        label: "Income",
        data: labels.map((m) => monthlyIncome[m] || 0),
        backgroundColor: "#34d399",
        borderRadius: 6,
      },
      {
        label: "Expense",
        data: labels.map((m) => monthlyExpense[m] || 0),
        backgroundColor: "#f87171",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true },
    },
  };

  if (labels.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-3">Monthly Trend</h3>
        <div className="text-gray-500 text-sm text-center py-8 border rounded bg-white">
          No data to display
        </div>
      </div>
    );
  }

  if (!showWrapper) {
    return (
      <div className="h-48 sm:h-72">
        <Bar data={data} options={options} />
      </div>
    );
  }

  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
      <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Monthly Trend</h3>
      <div className="h-48 sm:h-72">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}


