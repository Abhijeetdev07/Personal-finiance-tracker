

import { useState, useContext } from "react";
import { AuthContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // import react icons

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
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.token); // save token to context + localStorage
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, #34D399, #3B82F6, #1E40AF)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Login
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-3 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
          required
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"} // toggle password type
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
            required
          />
          <div
            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <AiFillEyeInvisible size={20} />
            ) : (
              <AiFillEye size={20} />
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#007dff] hover:bg-[#0066cc] text-white py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Login
        </button>

        {error && <p className="text-red-600 mb-2 mt-2 text-sm">{error}</p>}

        <p className="text-sm mt-3 text-center text-gray-600">
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
