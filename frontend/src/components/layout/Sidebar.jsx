import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Activity,
  GitBranch,
  Brain,
  BarChart2,
  Clock,
  Settings,
  Zap,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Activity, label: "Activity", path: "/activity" },
  { icon: GitBranch, label: "Repositories", path: "/repositories" },
  { icon: Brain, label: "AI Insights", path: "/ai-insights" },
  { icon: BarChart2, label: "Productivity", path: "/productivity" },
  { icon: Clock, label: "Timeline", path: "/timeline" },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center py-6 gap-2 border-r border-[#1E2A3A] bg-[#0D1320] z-50">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5B8CFF] to-[#9D6BFF] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap size={18} className="text-white" />
        </div>
      </div>

      {/* Nav Items */}
      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Tooltip key={path}>
              <TooltipTrigger asChild>
                <NavLink
                  to={path}
                  end
                  className={({ isActive }) =>
                    `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                      isActive
                        ? "bg-[#5B8CFF]/15 text-[#5B8CFF]"
                        : "text-[#4A5568] hover:text-[#8BA7CC] hover:bg-[#131929]"
                    }`
                  }
                >
                  <Icon size={18} />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#131929] border-[#1E2A3A] text-white text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Settings at bottom */}
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-[#5B8CFF]/15 text-[#5B8CFF]"
                    : "text-[#4A5568] hover:text-[#8BA7CC] hover:bg-[#131929]"
                }`
              }
            >
              <Settings size={18} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#131929] border-[#1E2A3A] text-white text-xs">
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  )
}