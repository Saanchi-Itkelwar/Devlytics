import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { GitBranch, Star, GitFork, Lock, Globe, ChevronRight, Search } from "lucide-react"
import { useRepos } from "../hooks/useAnalytics"
import { staggerContainer, staggerItem } from "../utils/animations"

function formatDate(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export default function Repositories() {
  const { data: repos, loading } = useRepos()
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState("last_activity")
  const navigate = useNavigate()

  const filtered = repos
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "commits") return b.commit_count - a.commit_count
      if (sortBy === "stars") return b.stars - a.stars
      if (sortBy === "last_activity") {
        return new Date(b.last_activity || 0) - new Date(a.last_activity || 0)
      }
      return 0
    })

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h2 className="text-xl font-semibold text-white">Repositories</h2>
        <p className="text-sm text-muted mt-1">All your repositories and their activity.</p>
      </motion.div>

      {/* Controls */}
      <motion.div variants={staggerItem} className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-surface border border-border-custom rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={13} className="text-muted" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white placeholder:text-muted outline-none w-full"
          />
        </div>

        <div className="flex gap-1">
          {[
            { key: "last_activity", label: "Recent" },
            { key: "commits", label: "Commits" },
            { key: "stars", label: "Stars" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === key
                  ? "bg-accent-blue/15 text-accent-blue"
                  : "text-muted hover:text-white bg-surface border border-border-custom"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={staggerItem}
        className="bg-surface border border-border-custom rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-border-custom">
          <div className="col-span-5 text-xs text-muted font-medium">Repository</div>
          <div className="col-span-2 text-xs text-muted font-medium text-center">Commits</div>
          <div className="col-span-1 text-xs text-muted font-medium text-center">PRs</div>
          <div className="col-span-1 text-xs text-muted font-medium text-center">Issues</div>
          <div className="col-span-2 text-xs text-muted font-medium">Last Activity</div>
          <div className="col-span-1" />
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-border-custom">
              <div className="col-span-5 h-4 bg-border-custom rounded animate-pulse" />
              <div className="col-span-2 h-4 bg-border-custom rounded animate-pulse" />
              <div className="col-span-1 h-4 bg-border-custom rounded animate-pulse" />
              <div className="col-span-1 h-4 bg-border-custom rounded animate-pulse" />
              <div className="col-span-2 h-4 bg-border-custom rounded animate-pulse" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted">No repositories found</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {filtered.map((repo) => (
              <motion.div
                key={repo.id}
                variants={staggerItem}
                onClick={() => navigate(`/repositories/${repo.id}`)}
                className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-border-custom last:border-0 hover:bg-[#0B0F17] cursor-pointer transition-colors group"
              >
                {/* Name */}
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                    <GitBranch size={13} className="text-accent-blue" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium truncate">{repo.name}</span>
                      {repo.is_private ? (
                        <Lock size={11} className="text-muted flex-shrink-0" />
                      ) : (
                        <Globe size={11} className="text-muted flex-shrink-0" />
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                        repo.source === "github"
                          ? "bg-[#24292e] text-gray-300"
                          : "bg-[#FC6D26]/15 text-[#FC6D26]"
                      }`}>
                        {repo.source}
                      </span>
                    </div>
                    {repo.language && (
                      <span className="text-xs text-muted">{repo.language}</span>
                    )}
                  </div>
                </div>

                {/* Commits */}
                <div className="col-span-2 flex items-center justify-center">
                  <span className="text-sm text-white font-medium">
                    {repo.commit_count.toLocaleString()}
                  </span>
                </div>

                {/* PRs */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm text-white">{repo.pr_count}</span>
                </div>

                {/* Issues */}
                <div className="col-span-1 flex items-center justify-center">
                  <span className="text-sm text-white">{repo.issue_count}</span>
                </div>

                {/* Last Activity */}
                <div className="col-span-2 flex items-center">
                  <span className="text-xs text-muted">{formatDate(repo.last_activity)}</span>
                </div>

                {/* Arrow */}
                <div className="col-span-1 flex items-center justify-end">
                  <ChevronRight
                    size={14}
                    className="text-muted group-hover:text-white transition-colors"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}