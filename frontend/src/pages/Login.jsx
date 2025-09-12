

import { useState, useContext } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import FloatingInput from "../components/FloatingInput";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // state for password visibility
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token);
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
        action="/api/auth/login"
        noValidate
        data-form-type="login"
        role="form"
        aria-label="Login form"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">
          Login
        </h2>

        {/* Hidden username field for password manager compatibility */}
        <input
          type="text"
          name="username"
          id="hidden-username-login"
          autoComplete="username"
          style={{ display: 'none' }}
          tabIndex={-1}
        />

        {/* Floating inputs with proper autocomplete for password managers */}
        <FloatingInput
          type="email"
          name="email"
          label="Email/username"
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
          autoComplete="current-password"
        />

         {error && <p className="text-red-600 mb-2 mt-2 text-xs sm:text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#007dff] hover:bg-[#0066cc] text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer text-sm sm:text-base"
        >
          Login
        </button>

       <div className="mt-2 text-right">
          <Link to="/forgot-password" className="text-xs sm:text-sm text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <p className="text-xs sm:text-sm mt-3 text-center text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-medium hover:underline hover:text-blue-800"
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
