import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import { setUnauthorizedHandler } from "./utils/api";
import Home from "./pages/Home";

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
    try {
      // Redirect to Home after logout
      window.location.assign("/");
    } catch (_) {}
  };

  // Ensure API helper logs out on 401
  setUnauthorizedHandler(() => {
    logout();
  });


  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public Home */}
          <Route path="/" element={<Home />} />

          {/* Public auth routes with auth-aware redirects */}
          <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={token ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyResetOtp />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Dashboard */}
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
