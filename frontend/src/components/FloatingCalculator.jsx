import { useState } from "react";
import { BsCalculator } from "react-icons/bs";
import { FiX } from "react-icons/fi";
import Calculator from "./Calculator";

export default function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r ${isOpen ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center z-50`}
        aria-label={isOpen ? "Close Calculator" : "Open Calculator"}
        title={isOpen ? "Close Calculator" : "Open Calculator"}
      >
        {isOpen ? <FiX className="w-6 h-6" /> : <BsCalculator className="w-6 h-6" />}
      </button>

      {/* Calculator Modal */}
      {isOpen && <Calculator onClose={() => setIsOpen(false)} />}
    </>
  );
}
