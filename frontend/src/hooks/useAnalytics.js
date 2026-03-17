import { useState, useEffect, useCallback } from "react"
import api from "../services/api"

export function useOverview() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/analytics/overview")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useHeatmap() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/analytics/heatmap")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useLanguages() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/analytics/languages")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useCodingTime() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/analytics/coding-time")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useCommitFrequency(range = "month", repoId = null) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams({ range })
    if (repoId) params.append("repo_id", repoId)

    api.get(`/api/analytics/commit-frequency?${params}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [range, repoId])

  return { data, loading }
}

export function usePRCycleTime() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/analytics/pr-cycle-time")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useDayOfWeek() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/analytics/day-of-week")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useRepos() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/repos")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useRepoDetail(repoId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!repoId) return
    api.get(`/api/repos/${repoId}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [repoId])

  return { data, loading }
}

export function useSentimentTimeline(days = 90) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/ai/sentiment-timeline?days=${days}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  return { data, loading }
}

export function useMoodSummary() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/ai/mood-summary")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useWeeklyDigest() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/ai/weekly-digest")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useInsightCards() {
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)

  // Separate refresh function — always resets loading state
  const refresh = useCallback((forceRefresh = false) => {
    setLoading(true)
    return api.get(`/api/ai/insight-cards${forceRefresh ? "?force_refresh=true" : ""}`)
      .then(res => {
        setData(res.data.cards || [])
        setMeta({
          cached: res.data.cached,
          generated_at: res.data.generated_at,
          expires_at: res.data.expires_at,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Initial fetch: loading is already true from useState, so no setState in the effect body
  useEffect(() => {
    api.get("/api/ai/insight-cards")
      .then(res => {
        setData(res.data.cards || [])
        setMeta({
          cached: res.data.cached,
          generated_at: res.data.generated_at,
          expires_at: res.data.expires_at,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, meta, loading, refresh: () => refresh(true) }
}

export function usePersona() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/ai/persona")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useProductivitySummary() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/productivity/summary")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useCodingHours() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/productivity/coding-hours")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useStreakHistory() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/productivity/streak-history")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}

export function useCommitBurst() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/api/productivity/commit-burst")
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return { data, loading }
}