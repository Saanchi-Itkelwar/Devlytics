import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Github, Eye, EyeOff, Zap, ArrowRight } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login"
      const payload = isRegister
        ? { full_name: fullName, email, password, confirm_password: confirmPassword }
        : { email, password }

      const res = await api.post(endpoint, payload)
      await login(res.data.access_token)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleGitHub = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github`
  }

  const handleGitLab = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/gitlab`
  }

  const switchMode = () => {
    setIsRegister(!isRegister)
    setError("")
    setFullName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] flex">
      {/* Left — Login Card */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Devlytics</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-white mb-1">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted mb-8">
            {isRegister
              ? "Start analyzing your development activity"
              : "Sign in to your developer analytics dashboard"}
          </p>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGitHub}
              className="w-full flex items-center justify-center gap-3 bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white hover:border-[#2E3D54] transition-colors"
            >
              <Github size={16} />
              Continue with GitHub
            </button>

            <button
              onClick={handleGitLab}
              className="w-full flex items-center justify-center gap-3 bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white hover:border-[#2E3D54] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FC6D26">
                <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
              </svg>
              Continue with GitLab
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border-custom" />
            <span className="text-xs text-muted">or</span>
            <div className="flex-1 h-px bg-border-custom" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name — register only */}
            {isRegister && (
              <div>
                <label className="block text-xs text-muted mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-accent-blue transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-accent-blue transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface border border-border-custom rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none focus:border-accent-blue transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password — register only */}
            {isRegister && (
              <div>
                <label className="block text-xs text-muted mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-muted outline-none transition-colors pr-10 ${
                      confirmPassword && confirmPassword !== password
                        ? "border-red-400/50 focus:border-red-400"
                        : confirmPassword && confirmPassword === password
                        ? "border-green-400/50 focus:border-green-400"
                        : "border-border-custom focus:border-accent-blue"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {/* Live match indicator */}
                {confirmPassword && (
                  <p className={`text-xs mt-1.5 ${
                    confirmPassword === password ? "text-green-400" : "text-red-400"
                  }`}>
                    {confirmPassword === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (isRegister && confirmPassword !== password && confirmPassword !== "")}
              className="w-full flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait..."
                : isRegister ? "Create account" : "Sign in"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-xs text-muted text-center mt-6">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={switchMode}
              className="text-accent-blue hover:underline"
            >
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>

      {/* Right — Visual Panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-surface border-l border-border-custom relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-accent-blue/5 to-accent-purple/5" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent-purple/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center px-12">
          <div className="inline-flex items-center gap-2 bg-accent-blue/10 border border-accent-blue/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            <span className="text-xs text-accent-blue">AI-Powered Analytics</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Understand how you actually code
          </h2>
          <p className="text-sm text-muted max-w-xs mx-auto mb-8">
            Deep insights into your GitHub and GitLab activity, powered by AI.
          </p>

          <div className="space-y-3 text-left max-w-xs mx-auto">
            {[
              { emoji: "🧠", label: "Productivity Pattern", text: "You code 42% more on Wednesdays" },
              { emoji: "⚡", label: "Efficiency Insight", text: "PR merge time improved 18% this month" },
              { emoji: "🌙", label: "Coding Persona", text: "Night Owl Builder — peaks at 10PM" },
            ].map(({ emoji, label, text }) => (
              <div key={label} className="bg-[#0B0F17] border border-border-custom rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{emoji}</span>
                  <span className="text-xs text-muted">{label}</span>
                </div>
                <p className="text-sm text-white">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}