import { RefreshCw, CheckCircle, AlertCircle, Github } from "lucide-react"
import { useSync } from "../hooks/useSync"

export default function SyncBanner() {
  const { status, loading, triggerSync } = useSync()

  if (!status) return null

  const neverSynced = !status.last_synced_at && !status.is_syncing
  const hasError = status.error_message

  if (!neverSynced && !status.is_syncing && !hasError) return null

  return (
    <div className={`mx-6 mt-4 rounded-xl border px-4 py-3 flex items-center justify-between ${
      hasError
        ? "bg-red-400/10 border-red-400/20"
        : status.is_syncing
        ? "bg-accent-blue/10 border-accent-blue/20"
        : "bg-[#131929] border-border-custom"
    }`}>
      <div className="flex items-center gap-3">
        {status.is_syncing ? (
          <RefreshCw size={15} className="text-accent-blue animate-spin" />
        ) : hasError ? (
          <AlertCircle size={15} className="text-red-400" />
        ) : (
          <Github size={15} className="text-muted" />
        )}

        <div>
          <p className="text-sm text-white font-medium">
            {status.is_syncing
              ? "Syncing your GitHub & GitLab data..."
              : hasError
              ? "Sync failed"
              : "Connect GitHub or GitLab to sync your data"}
          </p>
          {hasError && (
            <p className="text-xs text-red-400 mt-0.5">{status.error_message}</p>
          )}
          {status.is_syncing && (
            <p className="text-xs text-muted mt-0.5">This may take a minute for large accounts</p>
          )}
        </div>
      </div>

      {!status.is_syncing && (
        <button
          onClick={triggerSync}
          disabled={loading}
          className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {hasError ? "Retry Sync" : "Sync Now"}
        </button>
      )}
    </div>
  )
}