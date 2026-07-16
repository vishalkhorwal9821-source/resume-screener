import { useState } from "react";
import { apiFetch } from "../api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1d4ed8,_#312e81)] flex items-center justify-center p-5">
      <div className="rounded-3xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🤖</div>
          <h1 className="text-2xl font-bold text-white">AI Resume Screener</h1>
          <p className="text-blue-100 text-sm mt-1">HR Portal - Sign in to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-blue-50 block mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-white/50 bg-white/80 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@hr.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-blue-50 block mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-white/50 bg-white/80 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <div className="mt-6 text-xs text-blue-100 text-center space-y-1">
          <p>Demo Admin: admin@hr.com / admin123</p>
          <p>Demo Recruiter: recruiter@hr.com / recruit123</p>
        </div>
      </div>
    </div>
  );
}
