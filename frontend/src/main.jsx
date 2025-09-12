


import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";

function AOSInit({ children }) {
  useEffect(() => {
    AOS.init({ duration: 700, once: true, easing: "ease-out-cubic" });
  }, []);
  return children;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AOSInit>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AOSInit>
  </React.StrictMode>
);
