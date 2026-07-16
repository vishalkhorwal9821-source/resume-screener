export default function Navbar({ user, page, setPage, onLogout }) {
  return (
    <nav className="sticky top-4 z-50 mx-4 max-w-7xl lg:mx-auto mt-4 rounded-2xl glass-panel border border-white/45 shadow-md">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm tracking-tight block">ResumeAI</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block -mt-1">Screener Hub</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl gap-0.5">
          <button
            onClick={() => setPage("screener")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              page === "screener"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <span>📋</span>
            <span>Screen</span>
          </button>
          <button
            onClick={() => setPage("history")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
              page === "history"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
            }`}
          >
            <span>🕐</span>
            <span>History</span>
          </button>
          {user.role === "Admin" && (
            <button
              onClick={() => setPage("users")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                page === "users"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
            >
              <span>👤</span>
              <span>Users</span>
            </button>
          )}
        </div>

        {/* Profile and Logout */}
        <div className="flex items-center gap-3.5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user.email}</p>
            <p className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider">{user.role}</p>
          </div>
          
          <div className="w-[1px] h-6 bg-slate-300/40 hidden sm:block" />

          <button
            onClick={onLogout}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/10 bg-red-500/5 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
