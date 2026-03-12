import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { GitBranch, Star, GitFork, Lock, Globe, ArrowUpRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { repoService } from "../services/analytics"

export default function Repositories() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("commits")
  const navigate = useNavigate()

  useEffect(() => {
    repoService.getAll()
      .then(res => setRepos(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = repos
    .filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0))

  const LANG_COLORS = {
    Python: "#3572A5", JavaScript: "#F1E05A", TypeScript: "#3178C6",
    Java: "#B07219", Go: "#00ADD8", Rust: "#DEA584", Ruby: "#701516",
    "C++": "#F34B7D", C: "#555555", CSS: "#563D7C", HTML: "#E34C26",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Repositories</h2>
        <p className="text-sm text-muted mt-1">
          {repos.length} repositories synced
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search repositories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-surface border border-border-custom rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-muted outline-none w-56"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-surface border border-border-custom rounded-lg px-3 py-1.5 text-xs text-white outline-none"
        >
          <option value="commits">Sort by Commits</option>
          <option value="pull_requests">Sort by PRs</option>
          <option value="issues">Sort by Issues</option>
          <option value="stars">Sort by Stars</option>
        </select>
      </div>

      {/* Table */}
      <Card className="bg-surface border-border-custom rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-custom">
                {["Repository", "Language", "Commits", "PRs", "Issues", "Last Activity", ""].map(h => (
                  <th
                    key={h}
                    className="text-left text-xs text-muted font-medium px-4 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-border-custom">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-border-custom rounded animate-pulse w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.map(repo => (
                    <tr
                      key={repo.id}
                      className="border-b border-border-custom hover:bg-[#0B0F17]/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/repositories/${repo.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <GitBranch size={13} className="text-muted flex-shrink-0" />
                          <div>
                            <p className="text-sm text-white font-medium">{repo.name}</p>
                            {repo.description && (
                              <p className="text-xs text-muted truncate max-w-48">
                                {repo.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {repo.language ? (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: LANG_COLORS[repo.language] || "#4A5568"
                              }}
                            />
                            <span className="text-xs text-white">{repo.language}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-white">{repo.commits}</td>
                      <td className="px-4 py-3 text-sm text-white">{repo.pull_requests}</td>
                      <td className="px-4 py-3 text-sm text-white">{repo.issues}</td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {repo.last_activity || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {repo.is_private
                            ? <Lock size={12} className="text-muted" />
                            : <Globe size={12} className="text-muted" />
                          }
                          <ArrowUpRight size={13} className="text-muted" />
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}