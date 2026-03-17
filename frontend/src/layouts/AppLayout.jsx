import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "../components/layout/Sidebar"
import Topbar from "../components/layout/Topbar"
import SyncBanner from "../components/SyncBanner"

const pageTitles = {
  "/dashboard": "Overview",
  "/dashboard/activity": "Activity",
  "/dashboard/repositories": "Repositories",
  "/dashboard/ai-insights": "AI Insights",
  "/dashboard/productivity": "Productivity",
  "/dashboard/timeline": "Timeline",
  "/dashboard/settings": "Settings",
}

export default function AppLayout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? "Devlytics"

  return (
    <div className="min-h-screen bg-[#0B0F17] flex">
      <Sidebar />
      <div className="flex-1 ml-16 flex flex-col min-h-screen">
        <Topbar title={title} />
        <SyncBanner />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}