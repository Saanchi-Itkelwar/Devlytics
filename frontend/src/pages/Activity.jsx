import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import CommitFrequencyChart from "../components/charts/CommitFrequencyChart"
import { analyticsService, repoService } from "../services/analytics"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts"

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#131929",
    border: "1px solid #1E2A3A",
    borderRadius: "8px",
    fontSize: "12px",
  },
}

export default function Activity() {
  const [commitFreq, setCommitFreq] = useState([])
  const [prCycleTime, setPrCycleTime] = useState(null)
  const [dayOfWeek, setDayOfWeek] = useState([])
  const [repos, setRepos] = useState([])
  const [period, setPeriod] = useState("month")
  const [selectedRepo, setSelectedRepo] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    repoService.getAll().then(res => setRepos(res.data)).catch(() => {})
    analyticsService.getPrCycleTime().then(res => setPrCycleTime(res.data)).catch(() => {})
    analyticsService.getDayOfWeek().then(res => setDayOfWeek(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    analyticsService
      .getCommitFrequency(period, selectedRepo || null)
      .then(res => setCommitFreq(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [period, selectedRepo])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Activity</h2>
        <p className="text-sm text-muted mt-1">Deep dive into your development patterns.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={selectedRepo}
          onChange={e => setSelectedRepo(e.target.value)}
          className="bg-surface border border-border-custom rounded-lg px-3 py-1.5 text-xs text-white outline-none"
        >
          <option value="">All Repositories</option>
          {repos.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <div className="flex gap-1 bg-surface border border-border-custom rounded-lg p-1">
          {["week", "month", "year"].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors capitalize ${
                period === p ? "bg-accent-blue text-white" : "text-muted hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Commit Frequency */}
      <Card className="bg-surface border-border-custom rounded-xl p-5">
        <h3 className="text-sm font-medium text-white mb-1">Commit Frequency</h3>
        <p className="text-xs text-muted mb-4">Daily commit activity</p>
        {loading ? (
          <div className="h-48 bg-border-custom rounded-lg animate-pulse" />
        ) : commitFreq.length > 0 ? (
          <CommitFrequencyChart data={commitFreq} />
        ) : (
          <div className="h-48 flex items-center justify-center text-xs text-muted">
            No data for this period
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Day of Week */}
        <Card className="bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Day of Week</h3>
          <p className="text-xs text-muted mb-4">Which days you commit most</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayOfWeek} {...tooltipStyle}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#4A5568", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4A5568", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={v => [v, "Commits"]}
                cursor={{ fill: "#1E2A3A" }}
              />
              <Bar dataKey="count" fill="#9D6BFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* PR Cycle Time */}
        <Card className="bg-surface border-border-custom rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">PR Cycle Time</h3>
              <p className="text-xs text-muted mt-0.5">Hours from open to merge</p>
            </div>
            {prCycleTime && (
              <div className="text-right">
                <p className="text-xl font-bold text-white">{prCycleTime.average_hours}h</p>
                <p className="text-xs text-muted">avg merge time</p>
              </div>
            )}
          </div>
          {prCycleTime?.data?.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={prCycleTime.data.slice(-15)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
                <XAxis dataKey="merged_at" hide />
                <YAxis
                  tick={{ fill: "#4A5568", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={v => [`${v}h`, "Cycle Time"]}
                  labelFormatter={(_, payload) => payload[0]?.payload?.title || ""}
                  cursor={{ fill: "#1E2A3A" }}
                />
                <Bar dataKey="hours" fill="#34D399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-xs text-muted">
              No merged PRs found
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}