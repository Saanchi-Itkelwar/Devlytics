import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = [
  "#5B8CFF", "#9D6BFF", "#34D399", "#FBBF24",
  "#F87171", "#38BDF8", "#FB923C", "#A78BFA",
]

export default function LanguageDonut({ data = [] }) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-40 text-xs text-muted">
      No language data
    </div>
  )

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={65}
            paddingAngle={2}
            dataKey="percentage"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#131929",
              border: "1px solid #1E2A3A",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value, name, props) => [
              `${value}%`,
              props.payload.language,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.language} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-xs text-white truncate max-w-24">{item.language}</span>
            </div>
            <span className="text-xs text-muted">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}