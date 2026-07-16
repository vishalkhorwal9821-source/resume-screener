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
  const [progress, setProgress] = useState({ current: 0, total: 0, status: "" });

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
    setProgress({ current: 0, total: 0, status: "" });
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
    setProgress({ current: 0, total: files.length, status: "Preparing uploads..." });

    const BATCH_SIZE = 4;
    let activeSessionId = null;
    let allResults = [];
    let allRejected = [];

    try {
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(files.length / BATCH_SIZE);
        
        setProgress({
          current: i,
          total: files.length,
          status: `Processing batch ${batchNum} of ${totalBatches} (${i} of ${files.length} resumes completed)...`
        });

        const formData = new FormData();
        formData.append("job_description", jobDescription);
        if (activeSessionId) {
          formData.append("session_id", activeSessionId);
        }
        batch.forEach((file) => formData.append("resumes", file));

        const response = await apiFetch("/screen", {
          method: "POST",
          token,
          body: formData,
        });

        const payload = await response.json();
        
        activeSessionId = payload.session_id;
        allResults = payload.results || [];
        if (payload.rejected_files) {
          allRejected = [...allRejected, ...payload.rejected_files];
        }
      }

      setProgress({
        current: files.length,
        total: files.length,
        status: `Successfully screened all ${files.length} resumes!`
      });
      
      setResults(allResults);
      setSessionId(activeSessionId);
      setRejectedFiles(allRejected);
    } catch (requestError) {
      setError(requestError.message || "Screening failed.");
      if (allResults.length > 0) {
        setResults(allResults);
        setSessionId(activeSessionId);
      }
    } finally {
      setLoading(false);
    }
  };

  const exportSession = (type) => {
    if (!sessionId) return;
    window.open(`${API}/export/${type}/${sessionId}`, "_blank");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Configuration Section */}
      <section className="rounded-3xl glass-panel p-6 md:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/40">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">AI Resume Screening</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Screen and rank up to 1,000+ resumes by parsing and scoring them in automated server-friendly batches.
            </p>
          </div>
          <button
            onClick={clearRun}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300/60 bg-white/40 hover:bg-white text-slate-700 shadow-sm transition-all duration-200"
          >
            Reset
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Job Description Area */}
          <div className="lg:col-span-7 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste detailed role requirements, responsibilities, and must-have skills..."
              rows={11}
              className="w-full glass-input px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:bg-white resize-y"
            />
          </div>

          {/* File Upload Area */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Upload Resumes</label>
              
              <div className="relative group border-2 border-dashed border-slate-300/80 hover:border-blue-500 bg-white/40 hover:bg-white/80 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="space-y-2">
                  <div className="text-3xl animate-pulse">📤</div>
                  <p className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Drag and drop or click to select files</p>
                  <p className="text-[10px] text-slate-400">Supports PDF and DOCX (Select up to 1,000+ files)</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="rounded-xl border border-slate-200/40 bg-white/40 p-3 max-h-[140px] overflow-y-auto space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Selected ({files.length} resumes)</p>
                  {files.map((file, index) => (
                    <div key={file.name + index} className="flex items-center justify-between text-xs text-slate-600 bg-white/70 px-2 py-1 rounded-lg">
                      <span className="truncate pr-4">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{(file.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              {/* Live Batch Progress Indicator */}
              {loading && progress.total > 0 && (
                <div className="space-y-2 bg-blue-500/10 border border-blue-500/20 p-3.5 rounded-xl animate-fade-in">
                  <div className="flex justify-between text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    <span className="truncate max-w-[250px]">{progress.status}</span>
                    <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={runScreening}
                disabled={loading}
                className="w-full btn-primary-shadow px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide uppercase text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Screening Resumes ({progress.current}/{progress.total})...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Start Screening</span>
                  </>
                )}
              </button>
              
              {error && (
                <div className="bg-red-50 border border-red-200/60 text-red-700 rounded-xl px-4 py-3 text-xs flex items-start gap-2 animate-shake">
                  <span className="mt-0.5">⚠️</span>
                  <span className="font-semibold leading-relaxed">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Rejected Files Area */}
      {rejectedFiles.length > 0 && (
        <section className="rounded-2xl border border-amber-200/60 bg-amber-50/50 backdrop-blur-md p-4 animate-fade-in">
          <h3 className="font-bold text-xs text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Rejected Files ({rejectedFiles.length})</span>
          </h3>
          <ul className="space-y-1 text-xs text-amber-700 font-medium max-h-[150px] overflow-y-auto">
            {rejectedFiles.map((file, idx) => (
              <li key={`${file.filename}-${idx}`} className="flex items-center gap-1.5">
                <span className="bullet text-[8px]">•</span>
                <strong>{file.filename}:</strong> {file.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-8 animate-slide-up">
          <StatsCards results={results} />
          
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-12">
              <SkillsChart results={results} />
            </div>
          </div>

          <section className="rounded-3xl glass-panel p-6 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/40">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Ranked Candidates</h3>
                <p className="text-xs text-slate-400 mt-0.5">Filter and review details for screened candidates.</p>
              </div>
              
              <div className="flex items-center gap-3 bg-white/40 px-3.5 py-2 rounded-xl border border-slate-200/30">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Min Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(event) => setMinScore(Number(event.target.value))}
                  className="w-24 md:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                />
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{minScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mb-6">
              <button
                onClick={() => exportSession("excel")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>📥</span>
                <span>Export Excel</span>
              </button>
              <button
                onClick={() => exportSession("pdf")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <span>📕</span>
                <span>Export PDF Report</span>
              </button>
            </div>

            <ResultsTable results={filteredResults} />
          </section>
        </div>
      )}
    </div>
  );
}
