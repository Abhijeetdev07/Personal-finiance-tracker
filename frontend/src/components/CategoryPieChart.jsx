import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ dataByCategory }) {
  const labels = Object.keys(dataByCategory);
  const values = Object.values(dataByCategory);

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
    labels,
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
      legend: { position: "bottom" },
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
    <div style={{ height: 200 }}>
      <Pie data={data} options={options} />
    </div>
  );
}


