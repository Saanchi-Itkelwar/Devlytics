import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell
} from "recharts"

function formatHour(h) {
  if (h === 0) return "12am"
  if (h === 12) return "12pm"
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export default function CodingTimeChart({ data = [] }) {
  const max = Math.max(...data.map(d => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="hour"
          tickFormatter={formatHour}
          tick={{ fill: "#4A5568", fontSize: 10 }}
          interval={3}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#4A5568", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#131929",
            border: "1px solid #1E2A3A",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          labelFormatter={(h) => formatHour(h)}
          formatter={(v) => [v, "Commits"]}
          cursor={{ fill: "#1E2A3A" }}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.count === max ? "#5B8CFF" : "#1E2A3A"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}