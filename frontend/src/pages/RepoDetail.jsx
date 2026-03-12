import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, GitFork, GitCommit, GitMerge, AlertCircle, Lock, Globe } from "lucide-react"
import { Card } from "@/components/ui/card"
import CommitFrequencyChart from "../components/charts/CommitFrequencyChart"
import LanguageDonut from "../components/charts/LanguageDonut"
import { repoService } from "../services/analytics"

export default function RepoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repo, setRepo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    repoService.getOne(id)
      .then(res => setRepo(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface rounded animate-pulse" />
        <div className="h-32 bg-surface rounded-xl animate-pulse" />
        <div className="h-64 bg-surface rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="flex items-center justify-center h-64 text-muted text-sm">
        Repository not found
      </div>
    )
  }

  const stats = [
    { label: "Commits", value: repo.recent_commits.length ? "10+" : "0", icon: GitCommit, color: "#5B8CFF" },
    { label: "PRs", value: repo.pr_stats.total, icon: GitMerge, color: "#34D399" },
    { label: "Issues", value: repo.issue_stats.total, icon: AlertCircle, color: "#FBBF24" },
    { label: "Stars", value: repo.stars, icon: Star, color: "#F87171" },
  ]

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/repositories")}
        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm"
      >
        <ArrowLeft size={15} />
        Back to Repositories
      </button>

      {/* Repo Header */}
      <Card className="bg-surface border-border-custom rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-white">{repo.name}</h2>
              {repo.is_private
                ? <Lock size={13} className="text-muted" />
                : <Globe size={13} className="text-muted" />
              }
              <span className="text-xs bg-accent-blue/10 text-accent-blue border border-accent-blue/20 px-2 py-0.5 rounded-full">
                {repo.source}
              </span>
            </div>
            {repo.description && (
              <p className="text-sm text-muted">{repo.description}</p>
            )}
            <p className="text-xs text-muted mt-2">Last activity: {repo.last_activity || "—"}</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Star size={12} /> {repo.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={12} /> {repo.forks}
            </span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[#0B0F17] border border-border-custom rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} style={{ color }} />
                <span className="text-xs text-muted">{label}</span>
              </div>
              <p className="text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Commit Frequency */}
        <Card className="lg:col-span-2 bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Commit Activity</h3>
          <p className="text-xs text-muted mb-4">Last 30 days</p>
          {repo.commit_frequency.length > 0 ? (
            <CommitFrequencyChart data={repo.commit_frequency} />
          ) : (
            <div className="h-48 flex items-center justify-center text-xs text-muted">
              No recent commits
            </div>
          )}
        </Card>

        {/* Languages */}
        <Card className="bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Languages</h3>
          <p className="text-xs text-muted mb-4">This repository</p>
          <LanguageDonut data={repo.languages} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PR Stats */}
        <Card className="bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Pull Request Stats</h3>
          <div className="space-y-3">
            {[
              { label: "Total PRs", value: repo.pr_stats.total, color: "#5B8CFF" },
              { label: "Merged", value: repo.pr_stats.merged, color: "#34D399" },
              { label: "Open", value: repo.pr_stats.open, color: "#FBBF24" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted">{label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-border-custom rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: repo.pr_stats.total
                          ? `${(value / repo.pr_stats.total) * 100}%`
                          : "0%",
                        backgroundColor: color,
                      }}
                    />
                  </div>
                  <span className="text-sm text-white w-6 text-right">{value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Commits */}
        <Card className="bg-surface border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Recent Commits</h3>
          <div className="space-y-3">
            {repo.recent_commits.length > 0 ? (
              repo.recent_commits.slice(0, 6).map((commit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">{commit.message}</p>
                    <p className="text-[10px] text-muted mt-0.5">
                      {commit.author} · {commit.committed_at?.split("T")[0]}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted">No recent commits</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}