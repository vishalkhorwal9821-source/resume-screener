import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

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

  const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#DBEAFE"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Top Skills Distribution</h3>
      <p className="text-sm text-gray-500 mb-4">Most common skills found across all uploaded resumes</p>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
            <XAxis
              dataKey="skill"
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value) => [`${value} resume${value > 1 ? "s" : ""}`, "Found in"]}
              contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-center py-8">No skill data available.</p>
      )}
    </div>
  );
}
