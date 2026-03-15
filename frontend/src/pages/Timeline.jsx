import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GitCommit, GitMerge, AlertCircle, Filter, RefreshCw } from "lucide-react"
import { staggerContainer, staggerItem } from "../utils/animations"
import { Skeleton } from "../components/Skeleton"
import api from "../services/api"

const EVENT_CONFIG = {
  commit: {
    icon: GitCommit,
    color: "#5B8CFF",
    bg: "bg-accent-blue/10",
    border: "border-accent-blue/20",
    label: "Commit",
  },
  pr: {
    icon: GitMerge,
    color: "#34D399",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    label: "Pull Request",
  },
  issue: {
    icon: AlertCircle,
    color: "#FBBF24",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    label: "Issue",
  },
}

function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  return then.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  })
}

function groupByDate(events) {
  const groups = {}
  events.forEach(event => {
    const date = new Date(event.timestamp)
    const key = date.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric"
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(event)
  })
  return groups
}

function TimelineEvent({ event }) {
  const config = EVENT_CONFIG[event.type]
  const Icon = config.icon

  return (
    <motion.div
      variants={staggerItem}
      className="flex gap-4 group"
    >
      {/* Icon */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-xl ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon size={14} style={{ color: config.color }} />
        </div>
        <div className="w-px flex-1 bg-border-custom mt-2" />
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-white font-medium truncate">{event.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${config.bg} border ${config.border}`}
                style={{ color: config.color }}>
                {config.label}
              </span>
              <span className="text-xs text-muted">{event.repo}</span>
              {event.meta && event.meta !== "open" && (
                <span className="text-xs text-muted capitalize">· {event.meta}</span>
              )}
            </div>
          </div>
          <span className="text-xs text-muted flex-shrink-0 mt-0.5">
            {formatTimeAgo(event.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

const FILTERS = [
  { key: null, label: "All" },
  { key: "commit", label: "Commits" },
  { key: "pr", label: "PRs" },
  { key: "issue", label: "Issues" },
]

export default function Timeline() {
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const LIMIT = 30

  const fetchEvents = useCallback(async (newFilter, newOffset = 0) => {
    if (newOffset === 0) setLoading(true)
    else setLoadingMore(true)

    try {
      const params = new URLSearchParams({
        limit: LIMIT,
        offset: newOffset,
      })
      if (newFilter) params.append("filter", newFilter)

      const res = await api.get(`/api/timeline/?${params}`)
      const { events: newEvents, total: newTotal } = res.data

      setTotal(newTotal)
      setEvents(prev => newOffset === 0 ? newEvents : [...prev, ...newEvents])
      setOffset(newOffset + newEvents.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents(filter, 0)
  }, [filter])

  const handleFilter = (key) => {
    setFilter(key)
    setOffset(0)
    setEvents([])
  }

  const grouped = groupByDate(events)
  const hasMore = offset < total

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Timeline</h2>
          <p className="text-sm text-muted mt-1">
            Your development activity as a story.
          </p>
        </div>
        {total > 0 && (
          <span className="text-xs text-muted bg-surface border border-border-custom px-3 py-1.5 rounded-lg">
            {total} events
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={13} className="text-muted" />
        {FILTERS.map(({ key, label }) => (
          <button
            key={String(key)}
            onClick={() => handleFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === key
                ? "bg-accent-blue/15 text-accent-blue"
                : "text-muted hover:text-white bg-surface border border-border-custom"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Events */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 pb-6">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-surface border border-border-custom rounded-xl">
          <GitCommit size={32} className="text-muted mb-3" />
          <p className="text-sm text-white font-medium">No events found</p>
          <p className="text-xs text-muted mt-1">Sync your data to populate the timeline</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateEvents]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border-custom" />
                <span className="text-xs text-muted px-3 py-1 bg-surface border border-border-custom rounded-full">
                  {date}
                </span>
                <div className="h-px flex-1 bg-border-custom" />
              </div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-0"
              >
                {dateEvents.map(event => (
                  <TimelineEvent key={event.id} event={event} />
                ))}
              </motion.div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchEvents(filter, offset)}
                disabled={loadingMore}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-custom rounded-lg text-sm text-white hover:border-[#2E3D54] transition-colors disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingMore ? "animate-spin" : ""} />
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}