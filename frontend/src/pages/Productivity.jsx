import { TrendingUp, TrendingDown, Flame, Zap, Clock } from "lucide-react"
import {
  useProductivitySummary,
  useCodingHours,
  useStreakHistory,
  useCommitBurst,
  useDayOfWeek,
} from "../hooks/useAnalytics"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts"

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="bg-surface border border-border-custom rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted">{label}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-muted"
        }`}>
          {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : null}
          {trend !== 0 && `${Math.abs(trend)}% vs last week`}
        </div>
      )}
    </div>
  )
}

const PERIOD_COLORS = {
  Night: "#9D6BFF",
  Morning: "#FBBF24",
  Afternoon: "#34D399",
  Evening: "#5B8CFF",
}

export default function Productivity() {
  const { data: summary, loading: summaryLoading } = useProductivitySummary()
  const { data: codingHours, loading: hoursLoading } = useCodingHours()
  const { data: streak, loading: streakLoading } = useStreakHistory()
  const { data: burst, loading: burstLoading } = useCommitBurst()
  const { data: dow, loading: dowLoading } = useDayOfWeek()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Productivity</h2>
        <p className="text-sm text-muted mt-1">Your development behavior and patterns.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Commits This Week"
          value={summaryLoading ? "—" : summary?.commits_this_week ?? 0}
          icon={Zap}
          color="#5B8CFF"
          trend={summaryLoading ? undefined : summary?.week_change_pct}
        />
        <StatCard
          label="Commits This Month"
          value={summaryLoading ? "—" : summary?.commits_this_month ?? 0}
          icon={TrendingUp}
          color="#34D399"
        />
        <StatCard
          label="Current Streak"
          value={streakLoading ? "—" : `${streak?.current_streak ?? 0}d`}
          sub={streakLoading ? "" : `Longest: ${streak?.longest_streak ?? 0}d`}
          icon={Flame}
          color="#F87171"
        />
        <StatCard
          label="Peak Coding Hour"
          value={summaryLoading ? "—" : summary?.peak_coding_hour ?? "—"}
          icon={Clock}
          color="#9D6BFF"
        />
      </div>

      {/* Coding Hours + Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Coding Hours */}
        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Coding Hours Distribution</h3>
          <p className="text-xs text-muted mb-4">When you commit throughout the day</p>
          {hoursLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={codingHours}
                margin={{ top: 5, right: 5, bottom: 5, left: -25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#4A5568" }}
                  tickLine={false}
                  axisLine={false}
                  interval={5}
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
                  formatter={(v, _, props) => [v, props.payload.period]}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {(codingHours || []).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={PERIOD_COLORS[entry.period]}
                      opacity={entry.count === 0 ? 0.15 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Period Legend */}
          <div className="flex gap-4 mt-3 flex-wrap">
            {Object.entries(PERIOD_COLORS).map(([period, color]) => (
              <div key={period} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted">{period}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week */}
        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Day of Week Activity</h3>
          <p className="text-xs text-muted mb-4">Your most and least active days</p>
          {dowLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dow} margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#4A5568" }}
                  tickLine={false}
                  axisLine={false}
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
                  formatter={(v) => [v, "Commits"]}
                />
                <Bar dataKey="count" fill="#5B8CFF" radius={[3, 3, 0, 0]} opacity={0.85}>
                  {(dow || []).map((entry, i) => {
                    const max = Math.max(...(dow || []).map(d => d.count))
                    return (
                      <Cell
                        key={i}
                        fill={entry.count === max ? "#5B8CFF" : "#9D6BFF"}
                        opacity={entry.count === 0 ? 0.2 : 0.85}
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Streak History */}
      <div className="bg-surface border border-border-custom rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white">Streak History</h3>
            <p className="text-xs text-muted mt-0.5">Daily commits for the past 60 days</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-accent-blue">
                {streakLoading ? "—" : streak?.current_streak ?? 0}
              </p>
              <p className="text-xs text-muted">Current</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-accent-purple">
                {streakLoading ? "—" : streak?.longest_streak ?? 0}
              </p>
              <p className="text-xs text-muted">Longest</p>
            </div>
          </div>
        </div>

        {streakLoading ? (
          <div className="h-28 bg-border-custom/30 rounded-lg animate-pulse" />
        ) : streak?.daily?.length > 0 ? (
          <ResponsiveContainer width="100%" height={100}>
            <BarChart
              data={streak.daily}
              margin={{ top: 0, right: 0, bottom: 0, left: -40 }}
            >
              <Tooltip
                contentStyle={{
                  backgroundColor: "#131929",
                  border: "1px solid #1E2A3A",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
                formatter={(v) => [v, "Commits"]}
              />
              <Bar dataKey="count" fill="#34D399" radius={[2, 2, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <p className="text-xs text-muted">No streak data yet</p>
          </div>
        )}
      </div>

      {/* Commit Burst Detection */}
      <div className="bg-surface border border-border-custom rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-1">Commit Burst Detection</h3>
        <p className="text-xs text-muted mb-4">
          Days with unusually high activity (2x your average)
        </p>
        {burstLoading ? (
          <div className="h-24 bg-border-custom/30 rounded-lg animate-pulse" />
        ) : burst?.burst_days?.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center gap-6 mb-3">
              <div>
                <p className="text-xs text-muted">Daily average</p>
                <p className="text-lg font-bold text-white">{burst.average} commits</p>
              </div>
              <div>
                <p className="text-xs text-muted">Burst threshold</p>
                <p className="text-lg font-bold text-accent-blue">{burst.threshold} commits</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {burst.burst_days.map((day, i) => (
                <div
                  key={i}
                  className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-3 text-center"
                >
                  <p className="text-lg font-bold text-accent-blue">{day.count}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center">
            <p className="text-xs text-muted">No burst days detected yet</p>
          </div>
        )}
      </div>
    </div>
  )
}