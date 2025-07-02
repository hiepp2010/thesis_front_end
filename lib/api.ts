import type { Task, Project, User, TaskStatus, TaskPriority } from "./data"

const API_BASE_URL = "/api"

// API response types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  total?: number
}

// Task API functions
export const taskApi = {
  // Get all tasks with optional filters
  getTasks: async (filters?: {
    projectId?: string
    status?: TaskStatus
    priority?: TaskPriority
    assigneeId?: string
    search?: string
  }): Promise<ApiResponse<Task[]>> => {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
    }

    const response = await fetch(`${API_BASE_URL}/tasks?${params}`)
    return response.json()
  },

  // Get a specific task
  getTask: async (id: string): Promise<ApiResponse<Task>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`)
    return response.json()
  },

  // Create a new task
  createTask: async (
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedPercentage">,
  ): Promise<ApiResponse<Task>> => {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    })
    return response.json()
  },

  // Update a task
  updateTask: async (id: string, updates: Partial<Task>): Promise<ApiResponse<Task>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
    return response.json()
  },

  // Delete a task
  deleteTask: async (id: string): Promise<ApiResponse<null>> => {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: "DELETE",
    })
    return response.json()
  },
}

// Project API functions
export const projectApi = {
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await fetch(`${API_BASE_URL}/projects`)
    return response.json()
  },

  createProject: async (project: Omit<Project, "id" | "progress">): Promise<ApiResponse<Project>> => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(project),
    })
    return response.json()
  },
}

// User API functions
export const userApi = {
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await fetch(`${API_BASE_URL}/users`)
    return response.json()
  },
}
