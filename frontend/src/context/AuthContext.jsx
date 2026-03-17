import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../services/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      Promise.resolve().then(() => setLoading(false))
      return
    }

    api.get("/api/auth/me")
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((token) => {
    localStorage.setItem("token", token)
    return api.get("/api/auth/me").then(res => setUser(res.data))
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}