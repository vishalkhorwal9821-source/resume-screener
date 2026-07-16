export default function Navbar({ user, page, setPage, onLogout }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-white/30 bg-white/30 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-slate-800 text-lg">ResumeAI</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPage("screener")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              page === "screener"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-white/60"
            }`}
          >
            📋 Screen Resumes
          </button>
          <button
            onClick={() => setPage("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              page === "history"
                ? "bg-blue-600 text-white"
                : "text-slate-700 hover:bg-white/60"
            }`}
          >
            🕐 History
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">{user.email}</p>
            <p className="text-xs text-blue-600 font-semibold">{user.role}</p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
