import { useState, useRef, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import LoadingAnimation from "./LoadingAnimation";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryPieChart({ transactions, showFilter = true, isLoading = false }) {
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

  // Predefined colors for first few categories
  const predefinedColors = [
    "#60a5fa", // Blue
    "#34d399", // Green
    "#f472b6", // Pink
    "#f59e0b", // Orange
    "#a78bfa", // Purple
    "#f87171", // Red
    "#10b981", // Emerald
    "#22d3ee", // Cyan
    "#fbbf24", // Yellow
  ];

  // Function to convert hex to HSL
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return [h * 360, s * 100, l * 100];
  };

  // Function to generate random colors for remaining categories
  const generateRandomColor = (index) => {
    // Use predefined colors for first 9 categories
    if (index < predefinedColors.length) {
      return predefinedColors[index];
    }
    
    // Get predefined color hues to avoid
    const predefinedHues = predefinedColors.map(color => hexToHsl(color)[0]);
    
    // Generate colors that are different from predefined ones
    let attempts = 0;
    let newHue, newSaturation, newLightness;
    let isTooClose;
    
    do {
      // Use golden angle with offset to avoid predefined hues
      newHue = ((index * 137.5) + (attempts * 30)) % 360;
      newSaturation = 65 + (index % 4) * 10; // 65-95%
      newLightness = 45 + (index % 3) * 15; // 45-75%
      
      // Check if this hue is too close to any predefined hue
      isTooClose = predefinedHues.some(predefinedHue => {
        const diff = Math.abs(newHue - predefinedHue);
        const minDiff = Math.min(diff, 360 - diff); // Handle wraparound
        return minDiff < 30; // Minimum 30 degrees difference
      });
      
      attempts++;
    } while (isTooClose && attempts < 10); // Max 10 attempts
    
    return `hsl(${Math.round(newHue)}, ${newSaturation}%, ${newLightness}%)`;
  };

  const data = {
    labels: truncatedLabels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, i) => generateRandomColor(i)),
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

  if (isLoading) {
    return (
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2 sm:gap-3">
          <h3 className="font-semibold text-sm sm:text-base">Spending by Category</h3>
          {showFilter && <CustomDropdown />}
        </div>
        <LoadingAnimation message="Loading data" />
      </div>
    );
  }

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


