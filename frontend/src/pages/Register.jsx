

import { useState, useContext } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import FloatingInput from "../components/FloatingInput";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [passwordHint, setPasswordHint] = useState({ len: false, upper: false, lower: false, num: false, special: false });
  const [showPassword, setShowPassword] = useState(false); // password visibility
  const [isLoading, setIsLoading] = useState(false);
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

    // Trim inputs
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const firstName = form.firstName.replace(/\s/g, "");
    const lastName = form.lastName.replace(/\s/g, "");

    // Required checks
    if (!username || !email || !password || !firstName) {
      setError("Username, email, password and first name are required");
      return;
    }

    // Username validation
    if (username.length < 5) {
      setError("Username must be at least 5 characters long");
      return;
    }
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (!usernamePattern.test(username)) {
      setError("Username can only contain letters and numbers");
      return;
    }

    // Names validation: letters only
    const namePattern = /^[a-zA-Z]+$/;
    if (!namePattern.test(firstName)) {
      setError("First name can only contain letters (no spaces or symbols)");
      return;
    }
    if (firstName.length < 3) {
      setError("First name must be at least 3 characters long");
      return;
    }
    if (lastName && !namePattern.test(lastName)) {
      setError("Last name can only contain letters (no spaces or symbols)");
      return;
    }

    // Client-side strong password check (mirrors backend)
    const strong = passwordHint.len && passwordHint.upper && passwordHint.lower && passwordHint.num && passwordHint.special;
    if (!strong) {
      setError("Password must be 8-12 chars with upper, lower, number and special character");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Register failed");
      if (data.token) {
        login(data.token);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
          id="hidden-username"
          autoComplete="username"
          style={{ display: 'none' }}
          tabIndex={-1}
        />

        {/* Floating inputs with proper autocomplete for password managers */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <FloatingInput
            type="text"
            name="firstName"
            label="First Name"
            value={form.firstName}
            onChange={handleChange}
            className="mb-0"
            required
            hasError={!!error}
            autoComplete="given-name"
          />

          <FloatingInput
            type="text"
            name="lastName"
            label="Last Name"
            value={form.lastName}
            onChange={handleChange}
            className="mb-0"
            required
            hasError={!!error}
            autoComplete="family-name"
          />
        </div>

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
          disabled={isLoading}
          className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base flex items-center justify-center ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#007dff] hover:bg-[#0066cc] text-white cursor-pointer"
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Register"
          )}
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
