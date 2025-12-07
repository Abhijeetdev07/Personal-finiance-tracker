import { useState, useEffect } from "react";


export default function Calculator({ onClose }) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Handle number input
  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  // Handle decimal point
  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  // Clear all
  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  // Backspace
  const backspace = () => {
    if (!waitingForOperand) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay === "" ? "0" : newDisplay);
    }
  };

  // Perform operation
  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  // Calculate result
  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return firstValue / secondValue;
      case "=":
        return secondValue;
      default:
        return secondValue;
    }
  };

  // Handle equals
  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(parseInt(e.key));
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") {
        performOperation(e.key);
      } else if (e.key === "Enter" || e.key === "=") {
        handleEquals();
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "c" || e.key === "C") {
        clearAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [display, previousValue, operation, waitingForOperand]);

  const buttonClass = "h-14 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md";
  const numberButtonClass = `${buttonClass} bg-white hover:bg-gray-50 text-gray-800`;
  const operatorButtonClass = `${buttonClass} bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white`;
  const specialButtonClass = `${buttonClass} bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white`;
  const equalsButtonClass = `${buttonClass} bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white`;

  return (
    <div 
      className="fixed bottom-24 right-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl p-6 w-80 z-40 animate-fade-in-up"
      onClick={(e) => e.stopPropagation()}
    >


        {/* Display */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 mb-4 shadow-inner">
          <div className="text-right text-3xl font-bold text-white break-all min-h-[2.5rem]">
            {display}
          </div>
          {operation && (
            <div className="text-right text-sm text-gray-400 mt-1">
              {previousValue} {operation}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <button onClick={clearAll} className={`${specialButtonClass} col-span-2`}>
            C
          </button>
          <button onClick={backspace} className={specialButtonClass}>
            ⌫
          </button>
          <button onClick={() => performOperation("/")} className={operatorButtonClass}>
            ÷
          </button>

          {/* Row 2 */}
          <button onClick={() => inputDigit(7)} className={numberButtonClass}>
            7
          </button>
          <button onClick={() => inputDigit(8)} className={numberButtonClass}>
            8
          </button>
          <button onClick={() => inputDigit(9)} className={numberButtonClass}>
            9
          </button>
          <button onClick={() => performOperation("*")} className={operatorButtonClass}>
            ×
          </button>

          {/* Row 3 */}
          <button onClick={() => inputDigit(4)} className={numberButtonClass}>
            4
          </button>
          <button onClick={() => inputDigit(5)} className={numberButtonClass}>
            5
          </button>
          <button onClick={() => inputDigit(6)} className={numberButtonClass}>
            6
          </button>
          <button onClick={() => performOperation("-")} className={operatorButtonClass}>
            −
          </button>

          {/* Row 4 */}
          <button onClick={() => inputDigit(1)} className={numberButtonClass}>
            1
          </button>
          <button onClick={() => inputDigit(2)} className={numberButtonClass}>
            2
          </button>
          <button onClick={() => inputDigit(3)} className={numberButtonClass}>
            3
          </button>
          <button onClick={() => performOperation("+")} className={operatorButtonClass}>
            +
          </button>

          {/* Row 5 */}
          <button onClick={() => inputDigit(0)} className={`${numberButtonClass} col-span-2`}>
            0
          </button>
          <button onClick={inputDecimal} className={numberButtonClass}>
            .
          </button>
          <button onClick={handleEquals} className={equalsButtonClass}>
            =
          </button>
        </div>

        {/* Keyboard hint */}

    </div>
  );
}
