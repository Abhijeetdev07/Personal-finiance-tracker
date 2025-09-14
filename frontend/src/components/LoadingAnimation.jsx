import { useState, useEffect } from "react";

export default function LoadingAnimation({ message = "Loading data", className = "" }) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center">
        <div className="text-gray-500 text-sm">
          {message}{dots}
        </div>
      </div>
    </div>
  );
}
