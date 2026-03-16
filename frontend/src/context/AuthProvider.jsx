import { useState, useEffect } from "react"
import { AuthContext } from "./AuthContext"
import api from "../services/api"

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

  const login = (token) => {
    localStorage.setItem("token", token)
    return api.get("/api/auth/me").then(res => setUser(res.data))
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}