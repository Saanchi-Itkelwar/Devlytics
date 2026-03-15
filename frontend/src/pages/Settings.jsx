import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock, Github, Link2, Link2Off,
  CheckCircle, AlertCircle, Save, RefreshCw,
} from "lucide-react"
import { staggerContainer, staggerItem } from "../utils/animations"
import { useAuth } from "../context/AuthContext"
import { useSync } from "../hooks/useSync"
import api from "../services/api"

function Section({ title, description, children }) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface border border-border-custom rounded-xl p-5"
    >
      <div className="mb-5 pb-4 border-b border-border-custom">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {children}
    </motion.div>
  )
}

function Toast({ message, type }) {
  if (!message) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium z-50 ${
        type === "success"
          ? "bg-green-400/10 border-green-400/20 text-green-400"
          : "bg-red-400/10 border-red-400/20 text-red-400"
      }`}
    >
      {type === "success"
        ? <CheckCircle size={14} />
        : <AlertCircle size={14} />
      }
      {message}
    </motion.div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { status, triggerSync, loading: syncLoading } = useSync()

  const [profile, setProfile] = useState(null)
  const [fullName, setFullName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    api.get("/api/settings/profile").then(res => {
      setProfile(res.data)
      setFullName(res.data.full_name || "")
    }).catch(console.error)
  }, [])

  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await api.patch("/api/settings/profile", { full_name: fullName })
      showToast("Profile updated successfully")
    } catch {
      showToast("Failed to update profile", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters", "error")
      return
    }
    setSaving(true)
    try {
      await api.patch("/api/settings/password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      showToast("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to change password", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDisconnect = async (provider) => {
    try {
      await api.post("/api/settings/disconnect", { provider })
      setProfile(prev => ({
        ...prev,
        [`${provider}_connected`]: false,
        [`${provider}_username`]: null,
      }))
      showToast(`${provider} disconnected`)
    } catch {
      showToast(`Failed to disconnect ${provider}`, "error")
    }
  }

  const handleConnect = (provider) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`
  }

  const initials = (fullName || user?.email || "D").charAt(0).toUpperCase()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h2 className="text-xl font-semibold text-white">Settings</h2>
        <p className="text-sm text-muted mt-1">Manage your account and integrations.</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {/* Profile */}
        <Section
          title="Profile"
          description="Update your display name and account information."
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xl font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {fullName || "No name set"}
              </p>
              <p className="text-xs text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-[#0B0F17] border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-accent-blue transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full bg-[#0B0F17] border border-border-custom rounded-xl px-4 py-2.5 text-sm text-muted outline-none cursor-not-allowed opacity-60"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={13} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Section>

        {/* Password */}
        <Section
          title="Password"
          description="Change your login password. OAuth accounts may not have a password set."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F17] border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0B0F17] border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-[#0B0F17] border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-red-400/50"
                    : confirmPassword && confirmPassword === newPassword
                    ? "border-green-400/50"
                    : "border-border-custom focus:border-accent-blue"
                }`}
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={saving || !currentPassword || !newPassword}
              className="flex items-center gap-2 bg-surface border border-border-custom hover:border-[#2E3D54] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Lock size={13} />
              {saving ? "Updating..." : "Update Password"}
            </button>
          </div>
        </Section>

        {/* Connected Integrations */}
        <Section
          title="Connected Integrations"
          description="Manage your GitHub and GitLab connections."
        >
          <div className="space-y-3">
            {/* GitHub */}
            <div className="flex items-center justify-between p-4 bg-[#0B0F17] border border-border-custom rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#24292e] border border-white/10 flex items-center justify-center">
                  <Github size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">GitHub</p>
                  <p className="text-xs text-muted">
                    {profile?.github_connected && profile?.github_username
                      ? `@${profile.github_username}`
                      : "Not connected"}
                  </p>
                </div>
              </div>

              {profile?.github_connected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Connected
                  </div>
                  <button
                    onClick={() => handleDisconnect("github")}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors ml-3 border border-border-custom px-2.5 py-1.5 rounded-lg hover:border-red-400/30"
                  >
                    <Link2Off size={11} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect("github")}
                  className="flex items-center gap-1.5 text-xs text-accent-blue border border-accent-blue/20 bg-accent-blue/10 px-3 py-1.5 rounded-lg hover:bg-accent-blue/15 transition-colors"
                >
                  <Link2 size={11} />
                  Connect
                </button>
              )}
            </div>

            {/* GitLab */}
            <div className="flex items-center justify-between p-4 bg-[#0B0F17] border border-border-custom rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1a1a2e] border border-white/10 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FC6D26">
                    <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">GitLab</p>
                  <p className="text-xs text-muted">
                    {profile?.gitlab_connected && profile?.gitlab_username
                      ? `@${profile.gitlab_username}`
                      : "Not connected"}
                  </p>
                </div>
              </div>

              {profile?.gitlab_connected ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Connected
                  </div>
                  <button
                    onClick={() => handleDisconnect("gitlab")}
                    className="flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors ml-3 border border-border-custom px-2.5 py-1.5 rounded-lg hover:border-red-400/30"
                  >
                    <Link2Off size={11} />
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect("gitlab")}
                  className="flex items-center gap-1.5 text-xs text-[#FC6D26] border border-[#FC6D26]/20 bg-[#FC6D26]/10 px-3 py-1.5 rounded-lg hover:bg-[#FC6D26]/15 transition-colors"
                >
                  <Link2 size={11} />
                  Connect
                </button>
              )}
            </div>
          </div>
        </Section>

        {/* Data & Sync */}
        <Section
          title="Data & Sync"
          description="Manage your data synchronization."
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0B0F17] border border-border-custom rounded-xl">
              <div>
                <p className="text-sm font-medium text-white">Manual Sync</p>
                <p className="text-xs text-muted mt-0.5">
                  {status?.last_synced_at
                    ? `Last synced ${new Date(status.last_synced_at).toLocaleString()}`
                    : "Never synced"}
                </p>
              </div>
              <button
                onClick={triggerSync}
                disabled={syncLoading || status?.is_syncing}
                className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  size={12}
                  className={(syncLoading || status?.is_syncing) ? "animate-spin" : ""}
                />
                {status?.is_syncing ? "Syncing..." : "Sync Now"}
              </button>
            </div>
          </div>
        </Section>

        {/* Danger Zone */}
        <Section
          title="Account"
          description="Account actions."
        >
          <button
            onClick={() => { logout(); window.location.href = "/login" }}
            className="flex items-center gap-2 text-sm text-red-400 border border-red-400/20 bg-red-400/5 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors"
          >
            Sign out
          </button>
        </Section>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  )
}