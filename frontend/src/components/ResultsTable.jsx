import { Fragment, useState } from "react";

function ScoreBadge({ score }) {
  const color =
    score >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" :
    score >= 40 ? "bg-amber-50 text-amber-700 border-amber-200/60" :
    "bg-rose-50 text-rose-700 border-rose-200/60";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${color}`}>
      {score}%
    </span>
  );
}

export default function ResultsTable({ results }) {
  const [expanded, setExpanded] = useState(null);

  if (!results || results.length === 0) {
    return <p className="text-slate-400 text-center text-xs py-12">No candidates match the selected filter.</p>;
  }

  return (
    <div className="overflow-x-auto -mx-6">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-slate-200/30 text-xs md:text-sm">
          <thead>
            <tr className="bg-slate-100/40 text-slate-500 font-bold text-left">
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px] rounded-tl-xl">Rank</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px]">Candidate</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px]">Final Score</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px]">Bias-Free</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px]">Skills Match</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px]">Education</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px]">Experience</th>
              <th className="px-6 py-3.5 tracking-wider uppercase text-[10px] rounded-tr-xl text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/30 bg-white/10">
            {results.map((r, i) => {
              const isExpanded = expanded === i;
              return (
                <Fragment key={r.filename + i}>
                  <tr
                    className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${isExpanded ? "bg-blue-50/20" : ""}`}
                    onClick={() => setExpanded(isExpanded ? null : i)}
                  >
                    {/* Rank */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm border
                        ${i === 0 ? "bg-amber-100 border-amber-300 text-amber-800" :
                          i === 1 ? "bg-slate-100 border-slate-300 text-slate-700" :
                          i === 2 ? "bg-orange-100 border-orange-300 text-orange-800" :
                          "bg-white border-slate-200 text-slate-500"}`}>
                        {i + 1}
                      </span>
                    </td>
                    
                    {/* Candidate Name */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 text-sm">{r.candidate_name}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px] mt-0.5">{r.filename}</div>
                      {r.has_bias_flags && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md mt-1">
                          ⚠️ Bias Flags
                        </span>
                      )}
                    </td>

                    {/* Final Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ScoreBadge score={r.final_score} />
                    </td>

                    {/* Bias Free Score */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ScoreBadge score={r.bias_free_score} />
                    </td>

                    {/* Skills Match Progress Bar */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              r.skill_match_score >= 70 ? "bg-emerald-500" :
                              r.skill_match_score >= 40 ? "bg-amber-500" :
                              "bg-rose-500"
                            }`}
                            style={{ width: `${r.skill_match_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-600">{r.skill_match_score}%</span>
                      </div>
                    </td>

                    {/* Education */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-600">
                      {r.education_level}
                    </td>

                    {/* Experience */}
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-600">
                      {r.experience_years} {r.experience_years === 1 ? "yr" : "yrs"}
                    </td>

                    {/* Details Trigger */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold text-blue-600">
                      <span className="inline-flex items-center gap-1 hover:underline">
                        <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                        <span>{isExpanded ? "▲" : "▼"}</span>
                      </span>
                    </td>
                  </tr>

                  {/* Expanded candidate profile */}
                  {isExpanded && (
                    <tr key={`detail-${i}`}>
                      <td colSpan={8} className="px-8 py-5 bg-slate-50/60 border-t border-b border-slate-200/20">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Left Column: Summary and Insights */}
                          <div className="md:col-span-6 space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">📌 Professional Summary</p>
                              <p className="text-xs text-slate-700 leading-relaxed bg-white/60 p-3.5 rounded-xl border border-slate-200/30">
                                {r.professional_summary || "No summary extracted."}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/60 p-3 rounded-xl border border-slate-200/30">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Recommendation</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider
                                  ${r.recommendation.toLowerCase().includes("strong") ? "bg-emerald-50 text-emerald-700 border-emerald-200/40" :
                                    r.recommendation.toLowerCase().includes("shortlist") ? "bg-blue-50 text-blue-700 border-blue-200/40" :
                                    r.recommendation.toLowerCase().includes("manual") ? "bg-amber-50 text-amber-700 border-amber-200/40" :
                                    "bg-slate-50 text-slate-600 border-slate-200/40"}`}>
                                  {r.recommendation}
                                </span>
                              </div>
                              <div className="bg-white/60 p-3 rounded-xl border border-slate-200/30">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Info</p>
                                <div className="text-[10px] font-semibold text-slate-700 space-y-0.5 truncate">
                                  <div className="truncate">📧 {r.contact_email || "N/A"}</div>
                                  <div className="truncate">📞 {r.contact_phone || "N/A"}</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Skills Metrics */}
                          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            
                            {/* Matched Skills */}
                            <div className="bg-emerald-50/30 border border-emerald-200/30 rounded-2xl p-4 flex flex-col">
                              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span>✅</span> <span>Matched ({r.matched_skills.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[140px] pr-1">
                                {r.matched_skills.length > 0 ? (
                                  r.matched_skills.map((s) => (
                                    <span key={s} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">None</span>
                                )}
                              </div>
                            </div>

                            {/* Missing Skills */}
                            <div className="bg-rose-50/30 border border-rose-200/30 rounded-2xl p-4 flex flex-col">
                              <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span>❌</span> <span>Missing ({r.missing_skills.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[140px] pr-1">
                                {r.missing_skills.length > 0 ? (
                                  r.missing_skills.map((s) => (
                                    <span key={s} className="bg-rose-50 border border-rose-100 text-rose-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">None</span>
                                )}
                              </div>
                            </div>

                            {/* Bias Flags */}
                            <div className="bg-orange-50/30 border border-orange-200/30 rounded-2xl p-4 flex flex-col">
                              <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <span>⚠️</span> <span>Bias Flags ({r.bias_flags.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-1 overflow-y-auto max-h-[140px] pr-1">
                                {r.bias_flags.length > 0 ? (
                                  r.bias_flags.map((f) => (
                                    <span key={f} className="bg-orange-50 border border-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                                      {f}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                    <span>✓</span> <span>No bias flagged</span>
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
