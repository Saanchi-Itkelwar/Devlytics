import { Bell, Search, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Topbar({ title = "Overview" }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const initials = user?.email?.charAt(0).toUpperCase() ?? "D"

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border-custom bg-[#0B0F17]/80 backdrop-blur-sm sticky top-0 z-40">
      <h1 className="text-sm font-medium text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-surface border border-border-custom rounded-lg px-3 py-1.5 w-52">
          <Search size={13} className="text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-xs text-white placeholder:text-muted outline-none w-full"
          />
        </div>

        {/* Notification bell */}
        <button className="w-8 h-8 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-muted hover:text-white transition-colors">
          <Bell size={14} />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-muted hover:text-red-400 transition-colors"
          title="Logout"
        >
          <LogOut size={14} />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center text-xs font-semibold text-white cursor-pointer">
          {initials}
        </div>
      </div>
    </header>
  )
}