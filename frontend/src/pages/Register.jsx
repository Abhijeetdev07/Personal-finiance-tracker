

import { useState, useContext } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import FloatingInput from "../components/FloatingInput";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import authBg from "../assets/auth.jpg";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", firstName: "", lastName: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordHint, setPasswordHint] = useState({ len: false, upper: false, lower: false, num: false, special: false });
  const [showPassword, setShowPassword] = useState(false); // password visibility
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field-specific error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
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
    setFieldErrors({});

    // Trim inputs
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const firstName = form.firstName.replace(/\s/g, "");
    const lastName = form.lastName.replace(/\s/g, "");

    const newFieldErrors = {};

    // Required checks
    if (!firstName) newFieldErrors.firstName = "First name is required";
    if (!username) newFieldErrors.username = "Username is required";
    if (!email) newFieldErrors.email = "Email is required";
    if (!password) newFieldErrors.password = "Password is required";

    // Username validation
    if (username && username.length < 5) newFieldErrors.username = "Username must be at least 5 characters long";
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (username && !usernamePattern.test(username)) newFieldErrors.username = "Username can only contain letters and numbers";

    // Names validation: letters only
    const namePattern = /^[a-zA-Z]+$/;
    if (firstName && !namePattern.test(firstName)) newFieldErrors.firstName = "First name can only contain letters (no spaces or symbols)";
    if (firstName && firstName.length < 3) newFieldErrors.firstName = "First name must be at least 3 characters long";
    if (lastName && !namePattern.test(lastName)) newFieldErrors.lastName = "Last name can only contain letters (no spaces or symbols)";

    // Client-side strong password check (mirrors backend)
    const strong = passwordHint.len && passwordHint.upper && passwordHint.lower && passwordHint.num && passwordHint.special;
    if (password && !strong) newFieldErrors.password = "Password must be 8-12 chars with upper, lower, number and special character";

    // If any field errors, set them and stop
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      // Show first error as general message for accessibility
      const firstMsg = Object.values(newFieldErrors)[0];
      setError(firstMsg);
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
      // On successful registration, redirect to login instead of auto-login
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Navbar />
      <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100vh-200px)]">
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
            hasError={!!fieldErrors.firstName}
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
            hasError={!!fieldErrors.lastName}
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
          hasError={!!fieldErrors.username}
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
          hasError={!!fieldErrors.email}
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
          hasError={!!fieldErrors.password}
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
      <Footer />
    </div>
  );
}
