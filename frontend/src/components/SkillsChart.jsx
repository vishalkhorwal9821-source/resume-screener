import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";

export default function SkillsChart({ results }) {
  // Count skill frequency across all resumes
  const skillCount = {};
  results.forEach((r) => {
    r.all_resume_skills.forEach((s) => {
      skillCount[s] = (skillCount[s] || 0) + 1;
    });
  });

  const data = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([skill, count]) => ({ skill, count }));

  const COLORS = ["#3b82f6", "#06b6d4", "#6366f1", "#8b5cf6", "#ec4899"];

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">📈 Top Skills Distribution</h3>
        <p className="text-xs text-slate-400 mt-0.5">Most common skills found across all screened resumes.</p>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, bottom: 40, left: -25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis
              dataKey="skill"
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
              interval={0}
              stroke="rgba(148, 163, 184, 0.2)"
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }} 
              stroke="rgba(148, 163, 184, 0.2)"
            />
            <Tooltip
              formatter={(value) => [`${value} resume${value > 1 ? "s" : ""}`, "Found in"]}
              contentStyle={{ 
                borderRadius: "12px", 
                fontSize: "11px", 
                backgroundColor: "rgba(15, 23, 42, 0.9)", 
                border: "none",
                color: "#f8fafc",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={45}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-slate-400 text-center text-xs py-12">No skill data available.</p>
      )}
    </div>
  );
}
