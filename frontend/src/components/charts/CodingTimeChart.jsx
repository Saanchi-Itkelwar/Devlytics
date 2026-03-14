import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"

export default function CodingTimeChart({ data = [] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
        <XAxis
          dataKey="hour"
          tick={{ fontSize: 10, fill: "#4A5568" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => {
            if (val === 0) return "12a"
            if (val === 6) return "6a"
            if (val === 12) return "12p"
            if (val === 18) return "6p"
            return ""
          }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#4A5568" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#131929",
            border: "1px solid #1E2A3A",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
          labelFormatter={(val) => {
            const h = parseInt(val)
            const suffix = h >= 12 ? "PM" : "AM"
            const display = h % 12 === 0 ? 12 : h % 12
            return `${display}:00 ${suffix}`
          }}
          formatter={(value) => [value, "Commits"]}
        />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.count === maxCount ? "#5B8CFF" : "#9D6BFF"}
              opacity={entry.count === 0 ? 0.2 : 0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}