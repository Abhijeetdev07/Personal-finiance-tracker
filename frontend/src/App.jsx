



import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { setUnauthorizedHandler } from "./utils/api";

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
  };

  // Ensure API helper logs out on 401
  setUnauthorizedHandler(() => {
    logout();
  });

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Default route → redirect based on auth */}
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />

          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route */}
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
