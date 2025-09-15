import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FloatingInput from "../components/FloatingInput";
import { getResetToken, getResetIdentifier, clearResetContext } from "../utils/resetTokenStore";
import { apiFetch } from "../utils/api";
import { BiArrowBack } from "react-icons/bi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ResetPassword() {
  const navigate = useNavigate();
  const tokenFromMemory = getResetToken();
  const identifierFromMemory = getResetIdentifier();
  const prefersToken = useMemo(() => !!tokenFromMemory, [tokenFromMemory]);

  const [useTokenFlow, setUseTokenFlow] = useState(prefersToken);
  const [identifier, setIdentifier] = useState(identifierFromMemory || "");
  const [verifiedIdentifier] = useState(identifierFromMemory || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });
  const [resetCompleted, setResetCompleted] = useState(false);

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

  // Do not auto-redirect; allow OTP fallback on this page if token is missing
  useEffect(() => {
    // no-op
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (resetCompleted) {
      // Do nothing after successful reset to avoid any redirects
      return;
    }
    const usingToken = !!tokenFromMemory;
    const pwdErr = validatePasswords();
    if (pwdErr) {
      setStatus({ loading: false, message: "", error: pwdErr });
      return;
    }
    setStatus({ loading: true, message: "", error: "" });

    // If no token, keep layout stable and send user to verify step
    if (!usingToken) {
      navigate("/verify-otp", { replace: true, state: { identifier } });
      setStatus({ loading: false, message: "", error: "" });
      return;
    }

    const payload = { token: tokenFromMemory, newPassword: password };

    try {
      const res = await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { Authorization: "skip" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      setResetCompleted(true);
      clearResetContext();
      setStatus({ loading: false, message: data.message || "Password reset successful.", error: "" });
      // Auto-redirect to login after brief delay so user can see the success message
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-6 min-h-[calc(100vh-200px)]">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
        <div className="relative mb-3 sm:mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-0 bg-transparent text-[#007dff] hover:text-[#0066cc]"
            aria-label="Go back"
          >
            <BiArrowBack size={18} className="sm:w-5 sm:h-5" />
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">Reset Password</h2>
        </div>

        {/* Always show password fields; identifier/OTP appear only when no token is present */}

        <div className="mb-3 sm:mb-4">
          <input
            type="text"
            value={verifiedIdentifier || identifier || ""}
            placeholder="Email or Username"
            readOnly
            disabled
            aria-readonly
            className="w-full p-2 sm:p-3 rounded border bg-blue-50 text-gray-700 opacity-80 cursor-not-allowed border-blue-100 text-sm sm:text-base"
          />
        </div>


        <FloatingInput
          type="password"
          name="password"
          label="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 sm:mb-4"
          required
          hasError={!!status.error}
        />

        <FloatingInput
          type={showConfirm ? "text" : "password"}
          name="confirmPassword"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mb-3 sm:mb-4"
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
            <p className="mt-1 text-gray-600 text-xs sm:text-sm">Proceed to <Link to="/login" className="text-blue-600 hover:underline">Login</Link>. Redirecting automatically...</p>
          </div>
        )}

        <button
          type="submit"
          disabled={status.loading || resetCompleted}
          className="w-full bg-[#007dff] hover:bg-[#0066cc] disabled:opacity-60 text-white py-2 sm:py-3 rounded-lg font-semibold transition-colors duration-200 cursor-pointer text-sm sm:text-base"
        >
          {status.loading ? "Resetting..." : "Reset Password"}
        </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}


