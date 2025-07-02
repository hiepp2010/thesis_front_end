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
    // Check for accessToken first (our standard)
    const accessToken = localStorage.getItem("accessToken")
    if (accessToken) return accessToken

    // Fallback to other possible token names
    const jwtToken = localStorage.getItem("jwt_token")
    if (jwtToken) return jwtToken

    const token = localStorage.getItem("token")
    if (token) return token
  }
  return null
}

// Get current user ID from localStorage or JWT token
function getCurrentUserId() {
  if (typeof window !== "undefined") {
    // Try to get from localStorage first
    const userId = localStorage.getItem("userId")
    if (userId) return userId

    // Try to decode from JWT token
    const token = getAuthToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        return payload.userId?.toString() || payload.sub?.toString()
      } catch (error) {
        console.warn("Could not decode JWT token:", error)
      }
    }
  }
  return null
}

// Transform API project to our internal format
const transformProject = (apiProject: any) => {
  return {
    id: apiProject.id.toString(),
    name: apiProject.name,
    description: apiProject.description || "",
    ownerId: apiProject.owner ? apiProject.owner.id.toString() : null,
    owner: apiProject.owner
      ? {
          id: apiProject.owner.id.toString(),
          username: apiProject.owner.username,
          email: apiProject.owner.email,
        }
      : null,
    members: apiProject.members
      ? apiProject.members.map((member: any) => ({
          id: member.id.toString(),
          username: member.username,
          email: member.email,
        }))
      : [],
    createdAt: apiProject.createdAt,
    updatedAt: apiProject.updatedAt,
  }
}

export const projectService = {
  // Get all projects accessible to current user (recommended approach)
  async getAllProjects() {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    try {
      // Get projects owned by current user
      const ownedProjects = await this.getProjectsByOwner(currentUserId)

      // Get projects where current user is a member
      const memberProjects = await this.getProjectsByMember(currentUserId)

      // Combine and deduplicate projects
      const allProjects = [...ownedProjects]

      // Add member projects that aren't already in owned projects
      memberProjects.forEach((memberProject) => {
        if (!allProjects.find((project) => project.id === memberProject.id)) {
          allProjects.push(memberProject)
        }
      })

      return allProjects
    } catch (error) {
      console.error("Error fetching user projects:", error)
      throw error
    }
  },

  // Get all projects (admin only - will return 403 for regular users)
  async getAllProjectsAdmin() {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    // This will throw an error with 403 status for regular users
    const projects = await handleResponse(response)
    return Array.isArray(projects) ? projects.map(transformProject) : []
  },

  // Get project by ID
  async getProjectById(id: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const project = await handleResponse(response)
    return transformProject(project)
  },

  // Create new project
  async createProject(projectData: any) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        name: projectData.name,
        description: projectData.description,
        memberIds: projectData.memberIds || [],
      }),
    })
    const createdProject = await handleResponse(response)
    return transformProject(createdProject)
  },

  // Update project
  async updateProject(id: string, projectData: any) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        name: projectData.name,
        description: projectData.description,
        memberIds: projectData.memberIds || [],
      }),
    })
    const updatedProject = await handleResponse(response)
    return transformProject(updatedProject)
  },

  // Delete project
  async deleteProject(id: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (response.status === 204) {
      return true
    }

    return handleResponse(response)
  },

  // Add member to project by ID
  async addMemberToProject(projectId: string, memberId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${memberId}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const updatedProject = await handleResponse(response)
    return transformProject(updatedProject)
  },

  // Add member to project by email
  async addMemberToProjectByEmail(projectId: string, memberEmail: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${projectId}/members/email/${encodeURIComponent(memberEmail)}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const updatedProject = await handleResponse(response)
    return transformProject(updatedProject)
  },

  // Remove member from project by ID
  async removeMemberFromProject(projectId: string, memberId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${projectId}/members/${memberId}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const updatedProject = await handleResponse(response)
    return transformProject(updatedProject)
  },

  // Remove member from project by email
  async removeMemberFromProjectByEmail(projectId: string, memberEmail: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/${projectId}/members/email/${encodeURIComponent(memberEmail)}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const updatedProject = await handleResponse(response)
    return transformProject(updatedProject)
  },

  // Get projects by owner (recommended for users)
  async getProjectsByOwner(ownerId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/owner/${ownerId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const projects = await handleResponse(response)
    return Array.isArray(projects) ? projects.map(transformProject) : []
  },

  // Get projects by member (recommended for users)
  async getProjectsByMember(memberId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/member/${memberId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const projects = await handleResponse(response)
    return Array.isArray(projects) ? projects.map(transformProject) : []
  },

  // Get current user's owned projects
  async getCurrentUserOwnedProjects() {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }
    return this.getProjectsByOwner(currentUserId)
  },

  // Get current user's member projects
  async getCurrentUserMemberProjects() {
    const currentUserId = getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }
    return this.getProjectsByMember(currentUserId)
  },

  // Get project comments
  async getProjectComments(projectId: string, page = 0, size = 20) {
    const token = getAuthToken()
    const response = await fetch(
      `${API_URL}/projects/comments/project/${projectId}/paginated?page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )
    const data = await handleResponse(response)
    return data?.content || []
  },

  // Create project comment
  async createProjectComment(projectId: string, content: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        projectId: Number.parseInt(projectId),
        content,
      }),
    })
    return handleResponse(response)
  },

  // Update project comment
  async updateProjectComment(commentId: string, content: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ content }),
    })
    return handleResponse(response)
  },

  // Delete project comment
  async deleteProjectComment(commentId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (response.status === 204) {
      return true
    }

    return handleResponse(response)
  },

  // Search comments in project
  async searchProjectComments(projectId: string, keyword: string, page = 0, size = 20) {
    const token = getAuthToken()
    const response = await fetch(
      `${API_URL}/projects/comments/project/${projectId}/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )
    const data = await handleResponse(response)
    return data?.content || []
  },

  // Get comment count by project
  async getProjectCommentCount(projectId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/projects/comments/project/${projectId}/count`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },
}
