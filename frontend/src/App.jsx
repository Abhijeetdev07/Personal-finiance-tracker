import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import { setUnauthorizedHandler } from "./utils/api";
import Home from "./pages/Home";
import About from "./pages/About";
import FloatingCalculator from "./components/FloatingCalculator";

// Create auth context to share token across app
export const AuthContext = createContext();

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    // Immediately redirect to login page to prevent any race conditions
    window.location.href = "/login";
  };

  // Ensure API helper redirects to home on 401
  setUnauthorizedHandler((message) => {
    setToken("");
    localStorage.removeItem("token");
    if (message) {
      alert(message);
    }
    window.location.href = "/";
  });


  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />

          {/* Public auth routes with auth-aware redirects */}
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/transactions" element={token ? <Transactions /> : <Navigate to="/login" />} />
        </Routes>
        
        {/* Global Floating Calculator */}
        <FloatingCalculator />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
