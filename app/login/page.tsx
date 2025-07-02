"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ListTodo, Github, Mail, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { authService } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    if (authService.isAuthenticated()) {
      console.log("User already authenticated, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("Attempting login with:", { username: email })

      // Use the real authentication API
      const response = await authService.login({
        username: email, // API accepts username or email
        password: password,
      })

      console.log("Login successful:", response)

      // Store user information
      authService.storeUser(response)

      console.log("Redirecting to dashboard...")

      // Force redirect to dashboard
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-blue-600 text-white p-2 rounded-lg mb-4">
              <ListTodo size={24} />
            </div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Username or Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="username or email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Link href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-md transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 py-2.5"
                onClick={() => setError("Social login is not implemented yet")}
              >
                <Github size={18} />
                <span>Github</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center gap-2 py-2.5"
                onClick={() => setError("Social login is not implemented yet")}
              >
                <Mail size={18} />
                <span>Google</span>
              </Button>
            </div>

            <p className="text-center text-gray-600 mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side - Purple background with content */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-purple-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/abstract-pattern.png')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-white p-12">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl mb-8">
            <ListTodo size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4 text-center">Discover More</h2>
          <p className="text-xl text-center max-w-md">
            Login to access your personalized dashboard and explore all features.
          </p>
        </div>
      </div>
    </div>
  )
}
