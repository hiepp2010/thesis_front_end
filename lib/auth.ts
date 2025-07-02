// Authentication API client - Updated to use API Gateway and cookies
const API_GATEWAY_URL = "https://fa1b-116-96-45-162.ngrok-free.app/api"

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  userId: number
  username: string
  email: string
  roles: string[]
}

export interface ApiError {
  error: string
}

class AuthService {
  // Login user via API Gateway
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("Making login request to:", `${API_GATEWAY_URL}/auth/login`)

    const response = await fetch(`${API_GATEWAY_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    console.log("Login response status:", response.status)
    const data = await response.json()
    console.log("Login response data:", data)

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    // Store tokens in both localStorage and cookies
    this.storeTokens(data.accessToken, data.refreshToken)

    return data
  }

  // Register user via API Gateway
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_GATEWAY_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Registration failed")
    }

    // Store tokens in both localStorage and cookies
    this.storeTokens(data.accessToken, data.refreshToken)

    return data
  }

  // Refresh access token via API Gateway
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${API_GATEWAY_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok) {
      // If refresh fails, clear tokens and redirect to login
      this.clearTokens()
      throw new Error(data.error || "Token refresh failed")
    }

    // Store new tokens in both localStorage and cookies
    this.storeTokens(data.accessToken, data.refreshToken)

    return data
  }

  // Logout user via API Gateway
  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken()

    if (refreshToken) {
      try {
        await fetch(`${API_GATEWAY_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ refreshToken }),
        })
      } catch (error) {
        console.error("Logout API call failed:", error)
      }
    }

    this.clearTokens()
  }

  // Token management - Store in both localStorage and cookies
  storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      // Store in localStorage
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      // Store in cookies (accessible by middleware)
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=604800; SameSite=Strict`

      console.log("Tokens stored in localStorage and cookies")
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken")
    }
    return null
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken")
    }
    return null
  }

  clearTokens(): void {
    if (typeof window !== "undefined") {
      // Clear localStorage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("user")

      // Clear cookies
      document.cookie = "accessToken=; path=/; max-age=0"
      document.cookie = "refreshToken=; path=/; max-age=0"

      console.log("Tokens cleared from localStorage and cookies")
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken()
    console.log("Checking authentication, token exists:", !!token)
    return !!token
  }

  // Get stored user info
  getUser(): AuthResponse | null {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user")
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }

  // Store user info
  storeUser(user: AuthResponse): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
      console.log("User info stored:", user)
    }
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.roles?.includes(role) || false
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole("ADMIN")
  }

  // Check if user is HR
  isHR(): boolean {
    return this.hasRole("HR")
  }

  // Check if user is manager
  isManager(): boolean {
    return this.hasRole("MANAGER")
  }

  // Get user roles
  getUserRoles(): string[] {
    const user = this.getUser()
    return user?.roles || []
  }
}

export const authService = new AuthService()
