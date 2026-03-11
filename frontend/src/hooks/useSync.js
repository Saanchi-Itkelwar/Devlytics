import { useState, useEffect, useCallback } from "react"
import api from "../services/api"

export function useSync() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await api.get("/api/sync/status")
      setStatus(res.data)
    } catch (err) {
      console.error("Failed to fetch sync status", err)
    }
  }, [])

  const triggerSync = async () => {
    setLoading(true)
    try {
      await api.post("/api/sync/trigger")
      await fetchStatus()
    } catch (err) {
      console.error("Failed to trigger sync", err)
    } finally {
      setLoading(false)
    }
  }

  // Poll every 5 seconds while syncing
  useEffect(() => {
    fetchStatus()
    const interval = setInterval(() => {
      fetchStatus()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return { status, loading, triggerSync, fetchStatus }
}