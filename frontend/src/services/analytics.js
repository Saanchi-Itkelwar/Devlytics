import api from "./api"

export const analyticsService = {
  getOverview: () => api.get("/api/analytics/overview"),
  getHeatmap: () => api.get("/api/analytics/heatmap"),
  getCommitFrequency: (period = "month", repoId = null) =>
    api.get("/api/analytics/commit-frequency", {
      params: { period, ...(repoId && { repo_id: repoId }) },
    }),
  getLanguages: () => api.get("/api/analytics/languages"),
  getCodingTime: () => api.get("/api/analytics/coding-time"),
  getPrCycleTime: () => api.get("/api/analytics/pr-cycle-time"),
  getDayOfWeek: () => api.get("/api/analytics/day-of-week"),
}

export const repoService = {
  getAll: () => api.get("/api/repos"),
  getOne: (id) => api.get(`/api/repos/${id}`),
}