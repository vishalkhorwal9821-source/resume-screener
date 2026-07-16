export default function StatsCards({ results }) {
  const total = results.length;
  const shortlisted = results.filter((r) => r.final_score >= 70).length;
  const avgScore = total > 0
    ? Math.round(results.reduce((s, r) => s + r.final_score, 0) / total)
    : 0;
  const topScore = total > 0 ? Math.max(...results.map((r) => r.final_score)) : 0;
  const biasCount = results.filter((r) => r.has_bias_flags).length;

  const cards = [
    { label: "Total Screened", value: total, icon: "📄", color: "border-blue-500/20 shadow-blue-500/5 text-blue-600" },
    { label: "Shortlisted (≥70%)", value: shortlisted, icon: "✅", color: "border-emerald-500/20 shadow-emerald-500/5 text-emerald-600" },
    { label: "Average Score", value: `${avgScore}%`, icon: "📊", color: "border-purple-500/20 shadow-purple-500/5 text-purple-600" },
    { label: "Top Score", value: `${topScore}%`, icon: "🏆", color: "border-amber-500/20 shadow-amber-500/5 text-amber-600" },
    { label: "Bias Flags", value: biasCount, icon: "⚠️", color: "border-rose-500/20 shadow-rose-500/5 text-rose-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className={`rounded-2xl p-5 border glass-panel glass-panel-hover flex flex-col justify-between ${c.color} shadow-sm`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">{c.label}</span>
            <span className="text-lg">{c.icon}</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-slate-800">{c.value}</div>
        </div>
      ))}
    </div>
  );
}
