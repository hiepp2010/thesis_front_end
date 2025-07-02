"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { authService } from "@/lib/auth"

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg"
  showText?: boolean
}

export function LogoutButton({ variant = "ghost", size = "default", showText = true }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      // Even if API call fails, clear local tokens and redirect
      authService.clearTokens()
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
      {showText && (isLoading ? "Logging out..." : "Logout")}
    </Button>
  )
}
