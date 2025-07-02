// API client for making authenticated requests via API Gateway
const API_GATEWAY_URL = "https://fa1b-116-96-45-162.ngrok-free.app/api"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Get JWT token from localStorage
    const accessToken =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") || localStorage.getItem("jwt_token") : null

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)

      // Handle 401 - Token expired, try to refresh
      if (response.status === 401 && accessToken) {
        // Clear tokens and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("jwt_token")
          window.location.href = "/login"
        }
        throw new Error("Session expired. Please login again.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`)
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {}
      }

      return response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // HTTP methods
  async get(endpoint: string): Promise<any> {
    return this.makeRequest(endpoint, { method: "GET" })
  }

  async post(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string): Promise<any> {
    return this.makeRequest(endpoint, { method: "DELETE" })
  }

  async patch(endpoint: string, data?: any): Promise<any> {
    return this.makeRequest(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

export const apiClient = new ApiClient(API_GATEWAY_URL)
