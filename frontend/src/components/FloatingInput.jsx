import { useState } from "react";

export default function FloatingInput({
  type = "text",
  name,
  value,
  onChange,
  label,
  required = false,
  className = "",
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  hasError = false,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value !== "";

  return (
    <div className={`relative ${className}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full p-3 border rounded-lg focus:outline-none text-gray-700 transition-all duration-200 ${
          hasError 
            ? "border-red-500 focus:border-red-500" 
            : "border-gray-300 focus:border-[#007dff]"
        } ${showPasswordToggle ? "pr-12" : ""}`}
        required={required}
      />
      <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none ${
          isFloating
            ? `top-0 -translate-y-1/2 bg-white px-2 text-sm ${hasError ? "text-red-500" : "text-[#007dff]"}`
            : "top-1/2 -translate-y-1/2 text-gray-500"
        }`}
      >
        {label}
      </label>
      {showPasswordToggle && (
        <div
          className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
          onClick={onTogglePassword}
        >
          {showPassword ? (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path
                fillRule="evenodd"
                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}
