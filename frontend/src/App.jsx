import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import Landing from "./pages/Landing"
import Overview from "./pages/Overview"
import Activity from "./pages/Activity"
import Repositories from "./pages/Repositories"
import RepoDetail from "./pages/RepoDetail"
import AIInsights from "./pages/AIInsights"
import Productivity from "./pages/Productivity"
import Timeline from "./pages/Timeline"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import AuthCallback from "./pages/AuthCallback"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Overview />} />
          <Route path="activity" element={<Activity />} />
          <Route path="repositories" element={<Repositories />} />
          <Route path="repositories/:id" element={<RepoDetail />} />
          <Route path="ai-insights" element={<AIInsights />} />
          <Route path="productivity" element={<Productivity />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}