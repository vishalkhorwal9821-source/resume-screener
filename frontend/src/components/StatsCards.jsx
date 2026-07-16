export default function StatsCards({ results }) {
  const total = results.length;
  const shortlisted = results.filter((r) => r.final_score >= 70).length;
  const avgScore = total > 0
    ? Math.round(results.reduce((s, r) => s + r.final_score, 0) / total)
    : 0;
  const topScore = total > 0 ? Math.max(...results.map((r) => r.final_score)) : 0;
  const biasCount = results.filter((r) => r.has_bias_flags).length;

  const cards = [
    { label: "Total Screened", value: total, icon: "📄", color: "bg-blue-50 text-blue-700" },
    { label: "Shortlisted (≥70%)", value: shortlisted, icon: "✅", color: "bg-green-50 text-green-700" },
    { label: "Average Score", value: `${avgScore}%`, icon: "📊", color: "bg-purple-50 text-purple-700" },
    { label: "Top Score", value: `${topScore}%`, icon: "🏆", color: "bg-yellow-50 text-yellow-700" },
    { label: "Bias Flags", value: biasCount, icon: "⚠️", color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className={`rounded-2xl p-4 ${c.color} border border-opacity-20`}>
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-2xl font-bold">{c.value}</div>
          <div className="text-xs mt-1 opacity-80">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
