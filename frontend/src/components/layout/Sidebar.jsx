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
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: Activity, label: "Activity", path: "/dashboard/activity" },
  { icon: GitBranch, label: "Repositories", path: "/dashboard/repositories" },
  { icon: Brain, label: "AI Insights", path: "/dashboard/ai-insights" },
  { icon: BarChart2, label: "Productivity", path: "/dashboard/productivity" },
  { icon: Clock, label: "Timeline", path: "/dashboard/timeline" },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col items-center py-6 gap-2 border-r border-border-custom bg-[#0D1320] z-50">
      <div className="mb-6">
        <div className="w-9 h-9 rounded-xl bg-linear-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Zap size={18} className="text-white" />
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Tooltip key={path}>
              <TooltipTrigger asChild>
                <NavLink
                  to={path}
                  end={path === "/dashboard"}
                  className={({ isActive }) =>
                    `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "bg-accent-blue/15 text-accent-blue"
                        : "text-muted hover:text-[#8BA7CC] hover:bg-surface"
                    }`
                  }
                >
                  <Icon size={18} />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-surface border-border-custom text-white text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>

        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-accent-blue/15 text-accent-blue"
                    : "text-muted hover:text-[#8BA7CC] hover:bg-surface"
                }`
              }
            >
              <Settings size={18} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-surface border-border-custom text-white text-xs">
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  )
}