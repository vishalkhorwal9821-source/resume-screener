import { Fragment, useState } from "react";

function ScoreBadge({ score }) {
  const color =
    score >= 70 ? "bg-green-100 text-green-700" :
    score >= 40 ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
      {score}%
    </span>
  );
}

export default function ResultsTable({ results }) {
  const [expanded, setExpanded] = useState(null);

  if (!results || results.length === 0) {
    return <p className="text-gray-400 text-center py-8">No candidates match the filter.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-left">
            <th className="px-4 py-3 rounded-tl-lg">Rank</th>
            <th className="px-4 py-3">Candidate</th>
            <th className="px-4 py-3">Final Score</th>
            <th className="px-4 py-3">Bias-Free</th>
            <th className="px-4 py-3">Skills Match</th>
            <th className="px-4 py-3">Education</th>
            <th className="px-4 py-3">Experience</th>
            <th className="px-4 py-3 rounded-tr-lg">Details</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <Fragment key={r.filename + i}>
              <tr
                className="border-b border-gray-100 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <td className="px-4 py-4">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? "bg-yellow-400 text-white" :
                      i === 1 ? "bg-gray-300 text-white" :
                      i === 2 ? "bg-orange-400 text-white" :
                      "bg-gray-100 text-gray-500"}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-800">{r.candidate_name}</div>
                  <div className="text-xs text-gray-400">{r.filename}</div>
                  {r.has_bias_flags && (
                    <div className="text-xs text-orange-500 mt-0.5">⚠️ Bias flags detected</div>
                  )}
                </td>
                <td className="px-4 py-4"><ScoreBadge score={r.final_score} /></td>
                <td className="px-4 py-4"><ScoreBadge score={r.bias_free_score} /></td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${r.skill_match_score}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{r.skill_match_score}%</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-600">{r.education_level}</td>
                <td className="px-4 py-4 text-gray-600">{r.experience_years} yrs</td>
                <td className="px-4 py-4 text-blue-500 text-xs">{expanded === i ? "▲ Hide" : "▼ Show"}</td>
              </tr>

              {expanded === i && (
                <tr key={`detail-${i}`} className="bg-blue-50">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold text-green-700 mb-2">✅ Matched Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {r.matched_skills.length > 0
                            ? r.matched_skills.map((s) => (
                                <span key={s} className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">{s}</span>
                              ))
                            : <span className="text-xs text-gray-400">None</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-red-600 mb-2">❌ Missing Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {r.missing_skills.length > 0
                            ? r.missing_skills.map((s) => (
                                <span key={s} className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">{s}</span>
                              ))
                            : <span className="text-xs text-gray-400">None</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-600 mb-2">⚠️ Bias Flags</p>
                        {r.bias_flags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {r.bias_flags.map((f) => (
                              <span key={f} className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">{f}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-green-600">✓ No bias detected</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-700 mb-2">📌 Screening Insight</p>
                        <p className="text-xs text-gray-700 mb-2">{r.professional_summary}</p>
                        <p className="text-xs text-gray-600">Recommendation: <strong>{r.recommendation}</strong></p>
                        {(r.contact_email || r.contact_phone) && (
                          <p className="text-xs text-gray-500 mt-1">
                            Contact: {r.contact_email || "-"} {r.contact_phone ? `| ${r.contact_phone}` : ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
