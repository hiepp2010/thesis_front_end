"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService, type AuthResponse } from "@/lib/auth"

interface AuthContextType {
  user: AuthResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const loadUser = () => {
      const storedUser = authService.getUser()
      if (storedUser) {
        setUser(storedUser)
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login({ username, password })
      authService.storeUser(response)
      setUser(response)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const hasRole = (role: string) => {
    return user?.roles?.includes(role) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
