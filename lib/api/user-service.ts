// API URL for the API Gateway
const API_URL = "https://fa1b-116-96-45-162.ngrok-free.app/api"

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `API error: ${response.status}`)
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Get auth token from localStorage
function getAuthToken() {
  if (typeof window !== "undefined") {
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) return accessToken

    const jwtToken = localStorage.getItem("jwt_token")
    if (jwtToken) return jwtToken

    const token = localStorage.getItem("token")
    if (token) return token
  }
  return null
}

export const userService = {
  // Login user
  async login(credentials: { username: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    const data = await handleResponse(response)

    // Store tokens and user info in localStorage
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken)
      localStorage.setItem("refreshToken", data.refreshToken || "")
      localStorage.setItem("userId", data.userId?.toString() || "")
      localStorage.setItem("username", data.username || "")
      localStorage.setItem("userEmail", data.email || "")
    }

    return data
  },

  // Register new user
  async register(userData: { username: string; email: string; password: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    return handleResponse(response)
  },

  // Logout user
  async logout() {
    const token = getAuthToken()

    try {
      // Call logout endpoint if available
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.warn("Logout endpoint call failed:", error)
    } finally {
      // Always clear local storage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userId")
      localStorage.removeItem("username")
      localStorage.removeItem("userEmail")
    }
  },

  // Get current user info
  async getCurrentUser() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/auth/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Search users
  async searchUsers(query: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    return handleResponse(response)
  },

  // Get user by ID
  async getUserById(userId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    return handleResponse(response)
  },

  // Refresh token
  async refreshToken() {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) {
      throw new Error("No refresh token found")
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await handleResponse(response)

    // Update stored tokens
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken)
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken)
      }
    }

    return data
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!getAuthToken()
  },

  // Get stored user info
  getStoredUserInfo() {
    if (typeof window !== "undefined") {
      return {
        userId: localStorage.getItem("userId"),
        username: localStorage.getItem("username"),
        email: localStorage.getItem("userEmail"),
      }
    }
    return null
  },
}
