

import { useState, useContext } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [passwordHint, setPasswordHint] = useState({ len: false, upper: false, lower: false, num: false, special: false });
  const [showPassword, setShowPassword] = useState(false); // password visibility
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      const pwd = e.target.value;
      setPasswordHint({
        len: pwd.length >= 8 && pwd.length <= 12,
        upper: /[A-Z]/.test(pwd),
        lower: /[a-z]/.test(pwd),
        num: /\d/.test(pwd),
        special: /[^A-Za-z0-9]/.test(pwd),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check for empty fields
    const isUsernameEmpty = !form.username.trim();
    const isEmailEmpty = !form.email.trim();
    const isPasswordEmpty = !form.password.trim();
    
    if (isUsernameEmpty && isEmailEmpty && isPasswordEmpty) {
      setError("Username, email and password are required");
      return;
    }
    
    if (isUsernameEmpty) {
      setError("Username is required");
      return;
    }
    if (isEmailEmpty) {
      setError("Email is required");
      return;
    }
    if (isPasswordEmpty) {
      setError("Password is required");
      return;
    }

    // Username validation: min 5 chars, only letters and numbers
    if (form.username.length < 5) {
      setError("Username must be at least 5 characters long");
      return;
    }
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (!usernamePattern.test(form.username)) {
      setError("Username can only contain letters and numbers");
      return;
    }

    // Client-side strong password check (mirrors backend)
    const strong = passwordHint.len && passwordHint.upper && passwordHint.lower && passwordHint.num && passwordHint.special;
    if (!strong) {
      setError("Password must be 8-12 chars with upper, lower, number and special character");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Register failed");

      login(data.token); // save token immediately after signup
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-4 py-6"
      style={{
        background:
          "radial-gradient(circle at top left, #34D399, #3B82F6, #1E40AF)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm"
        autoComplete="on"
        method="post"
        action="/api/auth/register"
        noValidate
        data-form-type="signup"
        role="form"
        aria-label="Registration form"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
          Register
        </h2>

        {/* Hidden username field for password manager compatibility */}
        <input
          type="text"
          name="username"
          id="username"
          autoComplete="username"
          style={{ display: 'none' }}
          tabIndex={-1}
        />

        {/* Floating inputs with proper autocomplete for password managers */}
        <FloatingInput
          type="text"
          name="username"
          label="Username"
          value={form.username}
          onChange={handleChange}
          className="mb-3 sm:mb-4"
          required
          hasError={!!error}
          autoComplete="username"
        />
        
        <FloatingInput
          type="email"
          name="email"
          label="Email"
          value={form.email}
          onChange={handleChange}
          className="mb-3 sm:mb-4"
          required
          hasError={!!error}
          autoComplete="email"
        />

        <FloatingInput
          type={showPassword ? "text" : "password"}
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          className="mb-3 sm:mb-4"
          required
          showPasswordToggle={true}
          onTogglePassword={() => setShowPassword(!showPassword)}
          showPassword={showPassword}
          hasError={!!error}
          autoComplete="new-password"
        />

        {error && (
          <p className="text-red-600 text-xs mb-2 -mt-2">{error}</p>
        )}

        

        <button
          type="submit"
          className="w-full bg-[#007dff] hover:bg-[#0066cc] text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer text-sm sm:text-base"
        >
          Register
        </button>

        <p className="text-xs sm:text-sm mt-3 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-medium hover:underline hover:text-blue-800"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
