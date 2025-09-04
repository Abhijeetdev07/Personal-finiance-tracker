import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import { getResetToken, getResetIdentifier, clearResetContext } from "../utils/resetTokenStore";
import { apiFetch } from "../utils/api";

export default function ResetPassword() {
  const tokenFromMemory = getResetToken();
  const identifierFromMemory = getResetIdentifier();
  const prefersToken = useMemo(() => !!tokenFromMemory, [tokenFromMemory]);

  const [useTokenFlow, setUseTokenFlow] = useState(prefersToken);
  const [identifier, setIdentifier] = useState(identifierFromMemory || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });

  const validatePasswords = () => {
    if (!password || !confirmPassword) return "Please fill both password fields";
    if (password !== confirmPassword) return "Passwords do not match";
    // Match backend rule: 8-12 chars, upper, lower, number, special
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,12}$/;
    if (!strong.test(password)) {
      return "Password must be 8-12 chars and include upper, lower, number, and special";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If using identifier+OTP flow, validate OTP is 6 digits
    if (!useTokenFlow) {
      const isSixDigit = /^\d{6}$/.test(otp);
      if (!isSixDigit) {
        setStatus({ loading: false, message: "", error: "Enter a valid 6-digit OTP" });
        return;
      }
    }
    const pwdErr = validatePasswords();
    if (pwdErr) {
      setStatus({ loading: false, message: "", error: pwdErr });
      return;
    }
    setStatus({ loading: true, message: "", error: "" });

    const payload = useTokenFlow && tokenFromMemory
      ? { token: tokenFromMemory, newPassword: password }
      : { identifier, otp, newPassword: password };

    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { Authorization: "skip" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      clearResetContext();
      setStatus({ loading: false, message: data.message || "Password reset successful.", error: "" });
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{
      background: "radial-gradient(circle at top left, #34D399, #3B82F6, #1E40AF)",
    }}>
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Reset Password</h2>

        {/* Always show password fields; identifier/OTP appear only when no token is present */}

        {!useTokenFlow && (
          <>
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

            <FloatingInput
              type="text"
              name="otp"
              label="OTP"
              value={otp}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                setOtp(digitsOnly);
              }}
              className="mb-4"
              required
              hasError={!!status.error}
            />
            <p className="text-[11px] text-gray-500 -mt-3 mb-3">Enter the 6-digit code sent to your email.</p>
          </>
        )}

        <FloatingInput
          type={showPassword ? "text" : "password"}
          name="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
          required
          hasError={!!status.error}
          showPasswordToggle={true}
          onTogglePassword={() => setShowPassword((v) => !v)}
          showPassword={showPassword}
        />

        <FloatingInput
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-4"
          required
          hasError={!!status.error}
          showPasswordToggle={true}
          onTogglePassword={() => setShowConfirm((v) => !v)}
          showPassword={showConfirm}
        />

        {status.error && <p className="text-red-600 text-xs mb-2 -mt-2">{status.error}</p>}
        {status.message && (
          <div className="mb-2 -mt-2 text-xs">
            <p className="text-green-600">{status.message}</p>
            <p className="mt-1 text-gray-600">Proceed to <Link to="/login" className="text-blue-600 hover:underline">Login</Link>.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status.loading}
          className="w-full bg-[#007dff] hover:bg-[#0066cc] disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer"
        >
          {status.loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}


