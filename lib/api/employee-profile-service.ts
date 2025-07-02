// API URL for the API Gateway
const API_URL = "https://fa1b-116-96-45-162.ngrok-free.app/api/hrms/employee-profiles"

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

export const employeeProfileService = {
  // Get my complete profile
  async getMyProfile() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/profile/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Update my profile
  async updateMyProfile(profileData: {
    bio?: string
    skills?: string[]
    phone?: string
    profilePictureUrl?: string
  }) {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/profile/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    })

    return handleResponse(response)
  },

  // Get my manager's profile
  async getMyManager() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/profile/me/manager`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Get public employee profile
  async getPublicProfile(employeeId: number) {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/${employeeId}/profile/public`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Get public employee directory
  async getPublicDirectory() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/users/public`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Get basic employee info
  async getMyEmployeeInfo() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/employees/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Get all employee profiles (HR only)
  async getAllEmployeeProfiles() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/employee-profiles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Search employees (MANAGER/HR only)
  async searchEmployees(searchTerm: string) {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Get employee statistics (HR only)
  async getEmployeeStatistics() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },

  // Get team profiles (MANAGER/HR only)
  async getTeamProfiles() {
    const token = getAuthToken()
    if (!token) {
      throw new Error("No authentication token found")
    }

    const response = await fetch(`${API_URL}/team`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return handleResponse(response)
  },
}
