import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Zap } from "lucide-react"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center animate-pulse">
          <Zap size={18} className="text-white" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}