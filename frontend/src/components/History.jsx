import { useEffect, useState } from "react";
import { API } from "../api";
import ResultsTable from "./ResultsTable";

export default function History({ token }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch(`${API}/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-center text-slate-400 text-xs py-12">Loading history logs...</p>;

  if (sessions.length === 0)
    return (
      <div className="text-center py-16 text-slate-400 max-w-md mx-auto glass-panel rounded-3xl p-8 border">
        <div className="text-5xl mb-4 animate-bounce">📭</div>
        <p className="text-sm font-bold text-slate-700">No screening sessions yet.</p>
        <p className="text-xs text-slate-400 mt-1">Run your first screening session to view the reports history log here.</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">🕐 Screening History</h2>
        <p className="text-xs text-slate-400 mt-0.5">Logs of past resumes screened by your HR team.</p>
      </div>
      
      {sessions.map((s, i) => (
        <div key={s.session_id} className="glass-panel rounded-3xl p-6 shadow-md border hover:border-slate-300/40 transition-colors">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="space-y-1 pr-6 flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <span>Session #{i + 1}</span>
                <span className="bullet text-[8px] text-slate-300">•</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{s.results.length} Candidate{s.results.length > 1 ? "s" : ""}</span>
              </p>
              <p className="text-[10px] font-semibold text-slate-400 flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>By {s.created_by}</span>
                <span>•</span>
                <span>{new Date(s.created_at).toLocaleString()}</span>
              </p>
              <div className="text-xs text-slate-500 font-medium truncate max-w-2xl mt-1.5 bg-white/40 p-2 rounded-lg border border-slate-200/20">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Description Query:</span>
                <span className="block truncate mt-0.5 font-normal text-slate-600">{s.job_description}</span>
              </div>
            </div>
            <span className="text-blue-600 text-xs font-bold whitespace-nowrap bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all duration-200">
              {expanded === i ? "Hide Records ▲" : "View Records ▼"}
            </span>
          </div>

          {expanded === i && (
            <div className="mt-6 border-t border-slate-200/40 pt-6">
              <ResultsTable results={s.results} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
