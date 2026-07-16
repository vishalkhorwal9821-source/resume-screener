import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function Users({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/admin/users", { token });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-3xl glass-panel p-6 md:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/40">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">User Management</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Admin control panel displaying all registered HR recruiters and system administrators.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-md transition-all duration-200 flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh List</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200/60 text-red-700 rounded-xl px-4 py-3 text-xs mb-6 flex items-start gap-2">
            <span>⚠️</span>
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fetching User Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/30">
            <table className="w-full text-left border-collapse bg-white/40 backdrop-blur-md">
              <thead>
                <tr className="border-b border-slate-200/60 bg-slate-100/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Access Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Security / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30">
                {users.map((u) => {
                  const isPermanent = u.email === "vishalkhorwal9821@gmail.com" || u.email === "admin@hr.com" || u.email === "recruiter@hr.com";
                  return (
                    <tr key={u.id} className="hover:bg-white/60 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 font-mono">#{u.id}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800">{u.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            u.role === "Admin"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-emerald-50 border-emerald-200 text-emerald-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold">
                        {isPermanent ? (
                          <span className="flex items-center gap-1 text-blue-600">
                            <span>🔒</span>
                            <span>System Account (Permanent)</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-400">
                            <span>🔓</span>
                            <span>User Created Profile</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
