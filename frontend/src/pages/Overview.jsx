import { GitCommit, GitMerge, BookOpen, Flame, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  { label: "Total Commits", value: "—", icon: GitCommit, color: "#5B8CFF" },
  { label: "Active Repos", value: "—", icon: BookOpen, color: "#9D6BFF" },
  { label: "PRs Merged", value: "—", icon: GitMerge, color: "#34D399" },
  { label: "Issues Resolved", value: "—", icon: CheckCircle, color: "#FBBF24" },
  { label: "Coding Streak", value: "—", icon: Flame, color: "#F87171" },
]

export default function Overview() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Command Center</h2>
        <p className="text-sm text-[#4A5568] mt-1">
          Connect your GitHub or GitLab to start seeing your analytics.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card
            key={label}
            className="bg-[#131929] border-[#1E2A3A] p-4 rounded-xl hover:border-[#2E3D54] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#4A5568]">{label}</span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
          </Card>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Heatmap placeholder */}
        <div className="lg:col-span-2 bg-[#131929] border border-[#1E2A3A] rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Activity Heatmap</h3>
          <p className="text-xs text-[#4A5568] mb-4">Contribution activity over time</p>
          <div className="h-28 flex items-center justify-center border border-dashed border-[#1E2A3A] rounded-lg">
            <p className="text-xs text-[#4A5568]">Heatmap renders in Phase 4</p>
          </div>
        </div>

        {/* Language chart placeholder */}
        <div className="bg-[#131929] border border-[#1E2A3A] rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Languages</h3>
          <p className="text-xs text-[#4A5568] mb-4">Breakdown by language</p>
          <div className="h-28 flex items-center justify-center border border-dashed border-[#1E2A3A] rounded-lg">
            <p className="text-xs text-[#4A5568]">Chart renders in Phase 4</p>
          </div>
        </div>
      </div>

      {/* AI Insights placeholder */}
      <div className="bg-[#131929] border border-[#1E2A3A] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#5B8CFF] animate-pulse" />
          <h3 className="text-sm font-medium text-white">AI Insights</h3>
        </div>
        <div className="h-16 flex items-center justify-center border border-dashed border-[#1E2A3A] rounded-lg">
          <p className="text-xs text-[#4A5568]">AI insights render in Phase 5</p>
        </div>
      </div>
    </div>
  )
}