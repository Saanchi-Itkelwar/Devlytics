import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import Overview from "./pages/Overview"
import Placeholder from "./pages/Placeholder"
import Login from "./pages/Login"
import AuthCallback from "./pages/AuthCallback"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Overview />} />
          <Route path="/activity" element={<Placeholder page="Activity" />} />
          <Route path="/repositories" element={<Placeholder page="Repositories" />} />
          <Route path="/ai-insights" element={<Placeholder page="AI Insights" />} />
          <Route path="/productivity" element={<Placeholder page="Productivity" />} />
          <Route path="/timeline" element={<Placeholder page="Timeline" />} />
          <Route path="/settings" element={<Placeholder page="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}