import { GitCommit, GitMerge, BookOpen, Flame, CheckCircle, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import CommitHeatmap from "../components/charts/CommitHeatmap"
import LanguageDonut from "../components/charts/LanguageDonut"
import CodingTimeChart from "../components/charts/CodingTimeChart"
import { useOverview, useHeatmap, useLanguages, useCodingTime } from "../hooks/useAnalytics"
import { useInsightCards } from "../hooks/useAnalytics"

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <Card className="bg-surface border-border-custom p-4 rounded-xl hover:border-[#2E3D54] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted">{label}</span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-border-custom rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
      )}
    </Card>
  )
}

export default function Overview() {
  const { data: overview, loading: overviewLoading } = useOverview()
  const { data: heatmap, loading: heatmapLoading } = useHeatmap()
  const { data: languages, loading: languagesLoading } = useLanguages()
  const { data: codingTime, loading: codingTimeLoading } = useCodingTime()
  const { data: insightCards, loading: insightCardsLoading } = useInsightCards()

  const stats = [
    { label: "Total Commits", value: overview?.total_commits?.toLocaleString(), icon: GitCommit, color: "#5B8CFF" },
    { label: "Active Repos", value: overview?.active_repos, icon: BookOpen, color: "#9D6BFF" },
    { label: "PRs Merged", value: overview?.prs_merged, icon: GitMerge, color: "#34D399" },
    { label: "Issues Resolved", value: overview?.issues_resolved, icon: CheckCircle, color: "#FBBF24" },
    { label: "Coding Streak", value: overview?.coding_streak ? `${overview.coding_streak}d` : "0d", icon: Flame, color: "#F87171" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Command Center</h2>
        <p className="text-sm text-muted mt-1">Your developer activity at a glance.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={overviewLoading} />
        ))}
      </div>

      {/* Heatmap + Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border-custom rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Activity Heatmap</h3>
              <p className="text-xs text-muted mt-0.5">Commits over the last year</p>
            </div>
            {heatmapLoading && (
              <RefreshCw size={13} className="text-muted animate-spin" />
            )}
          </div>
          {heatmapLoading ? (
            <div className="h-28 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : (
            <CommitHeatmap data={heatmap} />
          )}
        </div>

        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white">Languages</h3>
            <p className="text-xs text-muted mt-0.5">Breakdown across all repos</p>
          </div>
          {languagesLoading ? (
            <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
          ) : (
            <LanguageDonut data={languages} />
          )}
        </div>
      </div>

      {/* Coding Time */}
      <div className="bg-surface border border-border-custom rounded-xl p-5">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-white">Coding Time Pattern</h3>
          <p className="text-xs text-muted mt-0.5">When you commit most throughout the day</p>
        </div>
        {codingTimeLoading ? (
          <div className="h-48 bg-border-custom/30 rounded-lg animate-pulse" />
        ) : (
          <CodingTimeChart data={codingTime} />
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-surface border border-border-custom rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
          <h3 className="text-sm font-medium text-white">AI Insights</h3>
          <span className="text-xs bg-accent-purple/15 text-accent-purple px-2 py-0.5 rounded-full ml-1">
            Gemini
          </span>
        </div>
        {insightCardsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-16 bg-border-custom/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : insightCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insightCards.slice(0, 2).map((card, i) => (
              <div key={i} className="bg-[#0B0F17] border border-border-custom rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{card.emoji}</span>
                  <span className="text-xs text-muted">{card.title}</span>
                </div>
                <p className="text-sm text-white">{card.insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center border border-dashed border-border-custom rounded-lg">
            <p className="text-xs text-muted">Sync data to generate AI insights</p>
          </div>
        )}
      </div>
    </div>
  )
}