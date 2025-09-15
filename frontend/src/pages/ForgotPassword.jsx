import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import FloatingInput from "../components/FloatingInput";
import { apiFetch } from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const MAX_ATTEMPTS = 3;
  const WINDOW_MS = 10 * 60 * 1000; // 10 minutes window

  const getAttemptsKey = (id) => `forgotOtpAttempts:${(id || "").trim().toLowerCase()}`;

  const startCooldown = (secs = 60) => {
    setCooldown(secs);
    const intervalId = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Rate limit: block after 3 back-to-back sends within WINDOW_MS
    try {
      const key = getAttemptsKey(identifier);
      const raw = sessionStorage.getItem(key);
      const now = Date.now();
      let attemptsData = { count: 0, windowStart: now };
      if (raw) {
        attemptsData = JSON.parse(raw);
        // Reset window if expired
        if (!attemptsData.windowStart || now - attemptsData.windowStart > WINDOW_MS) {
          attemptsData = { count: 0, windowStart: now };
        }
      }
      if (attemptsData.count >= MAX_ATTEMPTS) {
        setStatus({ loading: false, message: "", error: "Too many OTP requests. Please try after some time." });
        return;
      }
    } catch (_) {
      // ignore storage errors
    }
    // Show guidance message immediately on click
    setStatus({ loading: true, message: "you will get otp on your registred email address", error: "" });
    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { Authorization: "skip" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setStatus({ loading: false, message: "you will get otp on your registred email address", error: "" });
      // Start 60s cooldown on each successful request
      startCooldown(60);
      // Increment attempts counter inside the window
      try {
        const key = getAttemptsKey(identifier);
        const raw = sessionStorage.getItem(key);
        const now = Date.now();
        let attemptsData = { count: 0, windowStart: now };
        if (raw) {
          attemptsData = JSON.parse(raw);
          if (!attemptsData.windowStart || now - attemptsData.windowStart > WINDOW_MS) {
            attemptsData = { count: 0, windowStart: now };
          }
        }
        attemptsData.count += 1;
        sessionStorage.setItem(key, JSON.stringify(attemptsData));
        // If user just hit the limit, surface a non-blocking inline message
        if (attemptsData.count >= MAX_ATTEMPTS) {
          setStatus({ loading: false, message: "", error: "Too many OTP requests. Please try after some time." });
        }
      } catch (_) {
        // ignore storage errors
      }
      // Give the user a moment to read the message, then move to OTP verification
      setTimeout(() => navigate("/verify-otp", { state: { identifier } }), 600);
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100vh-200px)]">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
        <div className="relative mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-0 bg-transparent text-[#007dff] hover:text-[#0066cc]"
            aria-label="Go back"
          >
            <BiArrowBack size={18} className="sm:w-5 sm:h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">Forgot Password</h2>
        </div>

        <FloatingInput
          type="text"
          name="identifier"
          label="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="mb-3 sm:mb-4"
          required
          hasError={!!status.error}
        />

        {status.error && <p className="text-red-600 text-xs mb-2 -mt-2" role="alert">{status.error}</p>}
        {status.message && (
          <p className="text-green-600 text-xs mb-2 -mt-2" role="status" aria-live="polite">
            {status.message}
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={status.loading || cooldown > 0}
            className="w-full bg-[#007dff] hover:bg-[#0066cc] disabled:opacity-60 text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer text-sm sm:text-base"
            aria-disabled={cooldown > 0}
            aria-live="polite"
          >
            {status.loading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
          </button>
        </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}


