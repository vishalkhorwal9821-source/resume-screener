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

  if (loading) return <p className="text-center text-gray-400 py-12">Loading history...</p>;

  if (sessions.length === 0)
    return (
      <div className="text-center py-16 text-gray-400">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-lg">No screening sessions yet.</p>
        <p className="text-sm mt-1">Run your first screening to see history here.</p>
      </div>
    );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">🕐 Screening History</h2>
      {sessions.map((s, i) => (
        <div key={s.session_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div>
              <p className="font-medium text-gray-800">
                Session #{i + 1} — {s.results.length} candidate{s.results.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                By {s.created_by} · {new Date(s.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate max-w-lg">
                JD: {s.job_description.slice(0, 100)}...
              </p>
            </div>
            <span className="text-blue-500 text-sm">{expanded === i ? "▲ Hide" : "▼ Expand"}</span>
          </div>

          {expanded === i && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <ResultsTable results={s.results} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
