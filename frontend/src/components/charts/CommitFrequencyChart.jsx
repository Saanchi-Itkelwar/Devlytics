import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts"

export default function CommitFrequencyChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#4A5568", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(d) => {
            const date = new Date(d)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
          interval="preserveStartEnd"
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
          formatter={(v) => [v, "Commits"]}
          cursor={{ stroke: "#5B8CFF", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#5B8CFF"
          strokeWidth={2}
          fill="url(#commitGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#5B8CFF" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}