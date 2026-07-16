import { useMemo, useState } from "react";
import { API, apiFetch } from "../api";
import ResultsTable from "./ResultsTable";
import StatsCards from "./StatsCards";
import SkillsChart from "./SkillsChart";

export default function Screener({ token }) {
  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [minScore, setMinScore] = useState(0);

  const filteredResults = useMemo(
    () => results.filter((item) => item.final_score >= minScore),
    [results, minScore]
  );

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);
  };

  const clearRun = () => {
    setResults([]);
    setSessionId(null);
    setRejectedFiles([]);
    setError("");
  };

  const runScreening = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one resume file.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setRejectedFiles([]);

    const formData = new FormData();
    formData.append("job_description", jobDescription);
    files.forEach((file) => formData.append("resumes", file));

    try {
      const response = await apiFetch("/screen", {
        method: "POST",
        token,
        body: formData,
      });
      const payload = await response.json();
      setResults(payload.results || []);
      setSessionId(payload.session_id || null);
      setRejectedFiles(payload.rejected_files || []);
    } catch (requestError) {
      setError(requestError.message || "Screening failed.");
    } finally {
      setLoading(false);
    }
  };

  const exportSession = (type) => {
    if (!sessionId) return;
    window.open(`${API}/export/${type}/${sessionId}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/30 bg-white/20 backdrop-blur-xl shadow-xl p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">AI Resume Screening</h2>
            <p className="text-sm text-slate-700 mt-1">
              Upload PDF/DOCX resumes and score candidates against your job description.
            </p>
          </div>
          <button
            onClick={clearRun}
            className="text-sm px-4 py-2 rounded-xl border border-slate-300 bg-white/50 hover:bg-white"
          >
            Reset
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste detailed role requirements, responsibilities, and must-have skills..."
              rows={10}
              className="w-full rounded-2xl border border-slate-300 bg-white/70 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 block">Upload Resumes (PDF or DOCX)</label>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="w-full rounded-2xl border border-dashed border-slate-400 bg-white/60 p-3 text-sm"
            />
            <div className="text-sm text-slate-700">
              {files.length > 0 ? `${files.length} file(s) selected` : "No files selected"}
            </div>
            {files.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-xl bg-white/60 p-3 text-xs text-slate-600">
                {files.map((file) => (
                  <div key={file.name} className="py-1">
                    {file.name}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={runScreening}
              disabled={loading}
              className="w-full mt-2 px-4 py-3 rounded-2xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60"
            >
              {loading ? "Screening resumes..." : "Screen resumes"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </section>

      {rejectedFiles.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Rejected files</h3>
          <ul className="space-y-1 text-sm text-amber-700">
            {rejectedFiles.map((file) => (
              <li key={`${file.filename}-${file.reason}`}>
                <strong>{file.filename}:</strong> {file.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.length > 0 && (
        <>
          <StatsCards results={results} />
          <SkillsChart results={results} />

          <section className="rounded-3xl border border-white/30 bg-white/30 backdrop-blur-xl shadow-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Ranked Candidates</h3>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-700">Min score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(event) => setMinScore(Number(event.target.value))}
                />
                <span className="text-sm font-semibold text-slate-700">{minScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => exportSession("excel")}
                className="px-3 py-2 rounded-xl text-sm bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Export Excel
              </button>
              <button
                onClick={() => exportSession("pdf")}
                className="px-3 py-2 rounded-xl text-sm bg-rose-600 text-white hover:bg-rose-700"
              >
                Export PDF
              </button>
            </div>

            <ResultsTable results={filteredResults} />
          </section>
        </>
      )}
    </div>
  );
}
