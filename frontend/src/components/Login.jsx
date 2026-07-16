import { useState } from "react";
import { apiFetch } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Recruiter");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      onLogin(data);
    } catch (loginError) {
      setError(loginError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      setSuccessMessage("Account created successfully! You can now log in.");
      setIsRegister(false);
      setPassword(""); // Clear password
    } catch (regError) {
      setError(regError.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setSuccessMessage("");
    setPassword("");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-5 overflow-hidden select-none">
      {/* Vivid Liquid Gradient backdrops */}
      <div className="absolute top-[-25%] left-[-25%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-blue-600/25 via-indigo-600/20 to-purple-600/10 blur-[130px] pointer-events-none animate-blob" />
      <div className="absolute bottom-[-25%] right-[-25%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-cyan-600/20 via-blue-700/15 to-emerald-600/15 blur-[130px] pointer-events-none animate-blob-reverse delay-2000" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl shadow-2xl p-8 md:p-10 text-white transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4 animate-pulse">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-100 via-cyan-100 to-white bg-clip-text text-transparent">
            ResumeAI Screener
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            {isRegister ? "Create a new recruiter/admin profile" : "Sign in to the HR Intelligence Hub"}
          </p>
        </div>

        <div className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full border border-white/[0.08] bg-white/[0.04] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/[0.08] placeholder-slate-500 transition-all duration-200"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Password</label>
            <input
              type="password"
              className="w-full border border-white/[0.08] bg-white/[0.04] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/[0.08] placeholder-slate-500 transition-all duration-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (isRegister ? handleRegister() : handleLogin())}
            />
          </div>

          {/* Role Dropdown - Only visible in Registration Mode */}
          {isRegister && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">Organization Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-white/[0.08] bg-[#0c1524] rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="Recruiter">Recruiter (Can view own scans)</option>
                <option value="Admin">Admin (Can view all logs)</option>
              </select>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-emerald-200 text-xs text-center flex items-start gap-2.5">
              <span className="mt-0.5">✓</span>
              <span className="text-left font-medium leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-200 text-xs text-center flex items-start gap-2.5">
              <span className="mt-0.5">⚠️</span>
              <span className="text-left font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={isRegister ? handleRegister : handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3.5 rounded-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isRegister ? "Creating Account..." : "Signing in..."}</span>
              </>
            ) : (
              <span>{isRegister ? "Create Account" : "Sign In"}</span>
            )}
          </button>

          {/* Toggle Register/Login Link */}
          <div className="text-center pt-2">
            <button
              onClick={toggleMode}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isRegister ? "Already have an account? Sign In" : "Need an account? Create one"}
            </button>
          </div>
        </div>

        {/* Demo info */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-xs text-slate-400 font-semibold mb-3">Default Credentials (Pre-seeded)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left justify-items-center w-full">
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 text-[10px] text-slate-300 w-full text-center">
              <strong>Admin:</strong> admin@hr.com <span className="opacity-30">/</span> admin123
            </div>
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 text-[10px] text-slate-300 w-full text-center">
              <strong>Recruiter:</strong> recruiter@hr.com <span className="opacity-30">/</span> recruit123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
