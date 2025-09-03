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

export default function MonthlyBarChart({ monthlyIncome, monthlyExpense }) {
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
      <div className="text-gray-500 text-sm text-center py-8 border rounded bg-white">
        No data to display
      </div>
    );
  }

  return (
    <div style={{ height: 220 }}>
      <Bar data={data} options={options} />
    </div>
  );
}


