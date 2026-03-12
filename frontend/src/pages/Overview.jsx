import { useEffect, useState } from "react"
import { GitCommit, GitMerge, BookOpen, Flame, CheckCircle, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import CommitHeatmap from "../components/charts/CommitHeatmap"
import LanguageDonut from "../components/charts/LanguageDonut"
import CodingTimeChart from "../components/charts/CodingTimeChart"
import CommitFrequencyChart from "../components/charts/CommitFrequencyChart"
import { analyticsService } from "../services/analytics"

export default function Overview() {
  const [overview, setOverview] = useState(null)
  const [heatmap, setHeatmap] = useState([])
  const [languages, setLanguages] = useState([])
  const [codingTime, setCodingTime] = useState([])
  const [commitFreq, setCommitFreq] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [ov, hm, lang, ct, cf] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getHeatmap(),
          analyticsService.getLanguages(),
          analyticsService.getCodingTime(),
          analyticsService.getCommitFrequency(period),
        ])
        setOverview(ov.data)
        setHeatmap(hm.data)
        setLanguages(lang.data)
        setCodingTime(ct.data)
        setCommitFreq(cf.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [period])

  const stats = [
    {
      label: "Total Commits",
      value: overview?.total_commits ?? "—",
      icon: GitCommit,
      color: "#5B8CFF",
    },
    {
      label: "Active Repos",
      value: overview?.active_repos ?? "—",
      icon: BookOpen,
      color: "#9D6BFF",
    },
    {
      label: "PRs Merged",
      value: overview?.prs_merged ?? "—",
      icon: GitMerge,
      color: "#34D399",
    },
    {
      label: "Issues Resolved",
      value: overview?.issues_resolved ?? "—",
      icon: CheckCircle,
      color: "#FBBF24",
    },
    {
      label: "Coding Streak",
      value: overview?.coding_streak ? `${overview.coding_streak}d` : "—",
      icon: Flame,
      color: "#F87171",
    },
  ]

  // Peak coding hour insight
  const peakHour = codingTime.length
    ? codingTime.reduce((a, b) => (a.count > b.count ? a : b))
    : null

  const formatHour = (h) => {
    if (h === 0) return "12am"
    if (h === 12) return "12pm"
    return h < 12 ? `${h}am` : `${h - 12}pm`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Command Center</h2>
        <p className="text-sm text-muted mt-1">
          Your development activity at a glance.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="bg-surface border-border-custom p-4 rounded-xl hover:border-[#2E3D54] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted">{label}</span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">
              {loading ? (
                <span className="inline-block w-8 h-6 bg-border-custom rounded animate-pulse" />
              ) : (
                value
              )}
            </p>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="bg-surface border-border-custom rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-white">Activity Heatmap</h3>
            <p className="text-xs text-muted mt-0.5">Commit activity over the last year</p>
          </div>
          {overview && (
            <span className="text-xs text-muted">
              {overview.total_commits} total commits
            </span>
          )}
        </div>
        {loading ? (
          <div className="h-28 bg-border-custom rounded-lg animate-pulse" />
        ) : (
          <CommitHeatmap data={heatmap} />
        )}
      </Card>

      {/* Commit Frequency + Language side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-surface border-border-custom rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Commit Frequency</h3>
              <p className="text-xs text-muted mt-0.5">Commits over time</p>
            </div>
            {/* Period selector */}
            <div className="flex gap-1 bg-[#0B0F17] rounded-lg p-1">
              {["week", "month", "year"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors capitalize ${
                    period === p
                      ? "bg-accent-blue text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-48 bg-border-custom rounded-lg animate-pulse" />
          ) : commitFreq.length > 0 ? (
            <CommitFrequencyChart data={commitFreq} />
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-muted">
              No commit data for this period
            </div>
          )}
        </Card>

        <Card className="bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Languages</h3>
          <p className="text-xs text-muted mb-4">Breakdown across all repos</p>
          {loading ? (
            <div className="h-36 bg-border-custom rounded-lg animate-pulse" />
          ) : (
            <LanguageDonut data={languages} />
          )}
        </Card>
      </div>

      {/* Coding Time + AI insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Coding Time</h3>
          <p className="text-xs text-muted mb-4">When do you commit most?</p>
          {loading ? (
            <div className="h-40 bg-border-custom rounded-lg animate-pulse" />
          ) : (
            <CodingTimeChart data={codingTime} />
          )}
        </Card>

        {/* Insight card */}
        <Card className="bg-surface border-border-custom rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
              <h3 className="text-sm font-medium text-white">Quick Insights</h3>
            </div>

            <div className="space-y-3">
              {peakHour && (
                <div className="bg-[#0B0F17] border border-border-custom rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">🌙 Peak coding time</p>
                  <p className="text-sm text-white font-medium">
                    Around {formatHour(peakHour.hour)}
                  </p>
                </div>
              )}

              {languages[0] && (
                <div className="bg-[#0B0F17] border border-border-custom rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">💻 Top language</p>
                  <p className="text-sm text-white font-medium">
                    {languages[0].language} — {languages[0].percentage}%
                  </p>
                </div>
              )}

              {overview && (
                <div className="bg-[#0B0F17] border border-border-custom rounded-lg p-3">
                  <p className="text-xs text-muted mb-1">🔥 Current streak</p>
                  <p className="text-sm text-white font-medium">
                    {overview.coding_streak > 0
                      ? `${overview.coding_streak} day${overview.coding_streak > 1 ? "s" : ""}`
                      : "No active streak"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted mt-4">
            AI-powered insights available in Phase 5
          </p>
        </Card>
      </div>
    </div>
  )
}