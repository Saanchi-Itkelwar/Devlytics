import { useState } from "react"
import CommitFrequencyChart from "../components/charts/CommitFrequencyChart"
import { useCommitFrequency, usePRCycleTime, useDayOfWeek } from "../hooks/useAnalytics"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

const RANGES = ["week", "month", "year"]

export default function Activity() {
  const [range, setRange] = useState("month")
  const { data: commits, loading: commitsLoading } = useCommitFrequency(range)
  const { data: prData, loading: prLoading } = usePRCycleTime()
  const { data: dowData, loading: dowLoading } = useDayOfWeek()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Activity</h2>
        <p className="text-sm text-muted mt-1">Deep dive into your coding patterns.</p>
      </div>

      {/* Commit Frequency */}
      <div className="bg-surface border border-border-custom rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white">Commit Frequency</h3>
            <p className="text-xs text-muted mt-0.5">Commits over time</p>
          </div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                  range === r
                    ? "bg-accent-blue/15 text-accent-blue"
                    : "text-muted hover:text-white hover:bg-border-custom"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {commitsLoading ? (
          <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
        ) : (
          <CommitFrequencyChart data={commits} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day of Week */}
        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Day of Week Activity</h3>
          <p className="text-xs text-muted mb-4">Which days you commit most</p>
          {dowLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dowData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
                <Bar dataKey="count" fill="#9D6BFF" radius={[3, 3, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* PR Cycle Time */}
        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">PR Cycle Time</h3>
          <p className="text-xs text-muted mb-4">Average time from open to merge</p>
          {prLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : prData?.average_hours > 0 ? (
            <div className="space-y-4">
              <div className="bg-[#0B0F17] rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl font-bold text-accent-blue">
                  {prData.average_hours < 24
                    ? `${prData.average_hours}h`
                    : `${Math.round(prData.average_hours / 24)}d`}
                </div>
                <div>
                  <p className="text-xs text-white font-medium">Average merge time</p>
                  <p className="text-xs text-muted">across {prData.data.length} merged PRs</p>
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {prData.data.slice(-8).reverse().map((pr, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border-custom last:border-0">
                    <span className="text-xs text-white truncate max-w-[200px]">{pr.title}</span>
                    <span className="text-xs text-muted ml-2 flex-shrink-0">
                      {pr.hours < 24 ? `${pr.hours}h` : `${Math.round(pr.hours / 24)}d`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-xs text-muted">No merged PRs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}