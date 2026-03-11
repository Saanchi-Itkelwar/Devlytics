import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppLayout from "./layouts/AppLayout"
import Overview from "./pages/Overview"
import Placeholder from "./pages/Placeholder"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
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