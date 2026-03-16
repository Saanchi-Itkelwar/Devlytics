import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Star, GitFork } from "lucide-react"
import { useRepoDetail } from "../hooks/useAnalytics"
import CommitFrequencyChart from "../components/charts/CommitFrequencyChart"
import LanguageDonut from "../components/charts/LanguageDonut"

function StatPill({ label, value, color }) {
  return (
    <div className="bg-[#0B0F17] border border-border-custom rounded-xl p-4">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value ?? "—"}
      </p>
    </div>
  )
}

export default function RepoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: repo, loading } = useRepoDetail(id)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-border-custom rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-surface border border-border-custom rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!repo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted text-sm">Repository not found</p>
      </div>
    )
  }

  const prMergeRate = repo.total_prs > 0
    ? Math.round((repo.merged_prs / repo.total_prs) * 100)
    : 0

  const issueCloseRate = repo.total_issues > 0
    ? Math.round((repo.closed_issues / repo.total_issues) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate("/repositories")}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={13} />
          Back to Repositories
        </button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-semibold text-white">{repo.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                repo.source === "github"
                  ? "bg-[#24292e] text-gray-300"
                  : "bg-[#FC6D26]/15 text-[#FC6D26]"
              }`}>
                {repo.source}
              </span>
            </div>
            {repo.description && (
              <p className="text-sm text-muted">{repo.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              {repo.language && (
                <span className="text-xs text-muted">{repo.language}</span>
              )}
              <div className="flex items-center gap-1 text-xs text-muted">
                <Star size={11} />
                {repo.stars}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted">
                <GitFork size={11} />
                {repo.forks}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatPill label="Total Commits" value={repo.total_commits?.toLocaleString()} color="#5B8CFF" />
        <StatPill label="PRs Merged" value={`${repo.merged_prs} / ${repo.total_prs}`} color="#34D399" />
        <StatPill label="PR Merge Rate" value={`${prMergeRate}%`} color="#9D6BFF" />
        <StatPill label="Issue Close Rate" value={`${issueCloseRate}%`} color="#FBBF24" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Commit Activity</h3>
          <p className="text-xs text-muted mb-4">Last 30 days</p>
          <CommitFrequencyChart data={repo.commit_frequency} />
        </div>

        <div className="bg-surface border border-border-custom rounded-xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Languages</h3>
          <p className="text-xs text-muted mb-4">In this repository</p>
          <LanguageDonut data={repo.languages} />
        </div>
      </div>
    </div>
  )
}