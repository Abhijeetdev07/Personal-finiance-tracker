import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import { apiFetch } from "../utils/api";
import { setResetContext } from "../utils/resetTokenStore";
import { BiArrowBack } from "react-icons/bi";

export default function VerifyResetOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillIdentifier = location?.state?.identifier || "";
  const [identifier, setIdentifier] = useState(prefillIdentifier);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const [cooldown, setCooldown] = useState(0);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [resendLoading, setResendLoading] = useState(false);
  const timerRef = useRef(null);

  // Load countdown from sessionStorage on component mount
  useEffect(() => {
    const savedCooldown = sessionStorage.getItem('verifyOtpCooldown');
    const savedCooldownTime = sessionStorage.getItem('verifyOtpCooldownTime');
    
    if (savedCooldown && savedCooldownTime) {
      const elapsed = Math.floor((Date.now() - parseInt(savedCooldownTime)) / 1000);
      const remaining = Math.max(0, parseInt(savedCooldown) - elapsed);
      
      if (remaining > 0) {
        setCooldown(remaining);
        startCooldown(remaining);
      } else {
        // Clear expired countdown
        sessionStorage.removeItem('verifyOtpCooldown');
        sessionStorage.removeItem('verifyOtpCooldownTime');
      }
    }

    // Cleanup timer on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startCooldown = (secs = 60) => {
    // Clear any existing timer first
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setCooldown(secs);
    
    // Save countdown to sessionStorage
    sessionStorage.setItem('verifyOtpCooldown', secs.toString());
    sessionStorage.setItem('verifyOtpCooldownTime', Date.now().toString());
    
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          // Clear sessionStorage when countdown ends
          sessionStorage.removeItem('verifyOtpCooldown');
          sessionStorage.removeItem('verifyOtpCooldownTime');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic OTP validation: 6-digit numeric
    const isSixDigit = /^\d{6}$/.test(otp);
    if (!isSixDigit) {
      setIsOtpInvalid(true);
      setStatus({ loading: false, message: "", error: "Enter a valid 6-digit OTP" });
      return;
    }
    setStatus({ loading: true, message: "", error: "" });
    try {
      const res = await apiFetch("/auth/verify-reset-otp", {
        method: "POST",
        headers: { Authorization: "skip" },
        body: JSON.stringify({ identifier, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsOtpInvalid(true);
        throw new Error(data.error || "Verification failed");
      }

      // Store token only in memory
      setResetContext({ token: data.resetToken, identifier });

      setStatus({ loading: false, message: "OTP verified. Redirecting...", error: "" });
      setIsOtpInvalid(false);
      setTimeout(() => navigate("/reset-password"), 500);
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    setStatus({ loading: false, message: "", error: "" });
    try {
      const res = await apiFetch("/auth/forgot-password", {
        method: "POST",
        headers: { Authorization: "skip" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      setStatus({ loading: false, message: data.message || "If an account exists, we sent an OTP.", error: "" });
      startCooldown(60);
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{
      background: "radial-gradient(circle at top left, #34D399, #3B82F6, #1E40AF)",
    }}>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 w-96">
        <div className="relative mb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-0 bg-transparent text-[#007dff] hover:text-[#0066cc]"
            aria-label="Go back"
          >
            <BiArrowBack size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 text-center">Verify OTP</h2>
        </div>

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

        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">OTP</label>
          <div className="flex gap-2" role="group" aria-labelledby="otp-label">
            {otpDigits.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                inputMode="numeric"
                aria-label={`Digit ${idx + 1}`}
                className={`w-10 h-12 text-center text-lg rounded-md border outline-none transition-colors ${isOtpInvalid ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-[#007dff]"}`}
                type="text"
                value={d}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  // allow only one digit per box
                  const digit = val.slice(-1);
                  const next = [...otpDigits];
                  next[idx] = digit;
                  setOtpDigits(next);
                  const joined = next.join("");
                  setOtp(joined);
                  if (isOtpInvalid) setIsOtpInvalid(false);
                  if (digit && idx < 5) inputsRef.current[idx + 1]?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
                    const prev = idx - 1;
                    inputsRef.current[prev]?.focus();
                  }
                }}
                onPaste={(e) => {
                  const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
                  if (!pasted) return;
                  e.preventDefault();
                  const next = ["", "", "", "", "", ""];
                  pasted.split("").forEach((ch, i) => (next[i] = ch));
                  setOtpDigits(next);
                  setOtp(next.join(""));
                  const focusIndex = Math.min(pasted.length, 5);
                  inputsRef.current[focusIndex]?.focus();
                }}
                maxLength={1}
                required
              />
            ))}
          </div>
          <p id="otp-help" className="text-[11px] text-gray-500 mt-1">Enter the 6-digit code sent to your email.</p>
        </div>

        {status.error && (
          <p className="text-red-600 text-xs mb-2" role="alert">
            {status.error}
          </p>
        )}
        {status.message && (
          <p className="text-green-600 text-xs mb-2" role="status" aria-live="polite">
            {status.message}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resendLoading || !identifier}
            className={`text-sm ${cooldown > 0 ? "text-gray-400" : "text-blue-600 hover:underline"}`}
            aria-disabled={cooldown > 0}
            aria-live="polite"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resendLoading ? "Resending OTP..." : "Resend OTP"}
          </button>
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full bg-[#007dff] hover:bg-[#0066cc] disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer"
        >
          {status.loading ? "Verifying..." : "Verify"}
        </button>
      </form>
    </div>
  );
}


