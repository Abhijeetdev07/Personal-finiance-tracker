import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import { apiFetch } from "../utils/api";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

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
    setStatus({ loading: true, message: "", error: "" });
    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { Authorization: "skip" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setStatus({ loading: false, message: data.message || "If an account exists, we sent an OTP.", error: "" });
      // Move to OTP verification step with identifier prefilled
      navigate("/verify-otp", { state: { identifier } });
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{
      background: "radial-gradient(circle at top left, #34D399, #3B82F6, #1E40AF)",
    }}>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Forgot Password</h2>

        <FloatingInput
          type="text"
          name="identifier"
          label="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="mb-4"
          required
          hasError={!!status.error}
        />

        {status.error && <p className="text-red-600 text-xs mb-2 -mt-2">{status.error}</p>}
        {status.message && <p className="text-green-600 text-xs mb-2 -mt-2">{status.message}</p>}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={status.loading || cooldown > 0}
            className="w-full bg-[#007dff] hover:bg-[#0066cc] disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer"
            aria-disabled={cooldown > 0}
            aria-live="polite"
          >
            {status.loading ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
          </button>
        </div>
      </form>
    </div>
  );
}


