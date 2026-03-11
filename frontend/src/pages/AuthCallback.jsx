import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Zap } from "lucide-react"

export default function AuthCallback() {
  const navigate = useNavigate()
  const { login } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (token) {
      login(token).then(() => navigate("/")).catch(() => navigate("/login"))
    } else {
      navigate("/login")
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Zap size={18} className="text-white" />
        </div>
        <p className="text-sm text-muted">Signing you in...</p>
      </div>
    </div>
  )
}