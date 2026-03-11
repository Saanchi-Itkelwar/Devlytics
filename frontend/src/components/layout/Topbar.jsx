import { Bell, Search } from "lucide-react"

export default function Topbar({ title = "Overview" }) {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1E2A3A] bg-[#0B0F17]/80 backdrop-blur-sm sticky top-0 z-40">
      <h1 className="text-sm font-medium text-white">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#131929] border border-[#1E2A3A] rounded-lg px-3 py-1.5 w-52 group">
          <Search size={13} className="text-[#4A5568]" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-xs text-white placeholder:text-[#4A5568] outline-none w-full"
          />
        </div>

        {/* Notification bell */}
        <button className="w-8 h-8 rounded-lg bg-[#131929] border border-[#1E2A3A] flex items-center justify-center text-[#4A5568] hover:text-white transition-colors">
          <Bell size={14} />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B8CFF] to-[#9D6BFF] flex items-center justify-center text-xs font-semibold text-white cursor-pointer">
          D
        </div>
      </div>
    </header>
  )
}