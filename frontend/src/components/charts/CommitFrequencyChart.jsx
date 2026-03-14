import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"

export default function CommitFrequencyChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-xs text-muted">No commit data yet</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <defs>
          <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "#4A5568" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => {
            const d = new Date(val)
            return `${d.getMonth() + 1}/${d.getDate()}`
          }}
          interval="preserveStartEnd"
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
          labelFormatter={(val) => new Date(val).toLocaleDateString()}
          formatter={(value) => [value, "Commits"]}
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