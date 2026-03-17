import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (!token) {
      navigate("/login", { replace: true })
      return
    }

    login(token)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch(() => navigate("/login", { replace: true }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto animate-pulse" />
        <p className="text-sm text-muted">Signing you in...</p>
      </div>
    </div>
  )
}