// Type definitions for the application

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
}

export interface Project {
  id: string
  name: string
  description?: string
  owner: User
  members?: User[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "review" | "done" | "reopened"
  priority: "low" | "medium" | "high" | "critical"
  completedPercentage: number
  projectId: string
  assigneeId?: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  tags?: string[]
}

export interface TaskRelationship {
  id: string
  sourceTaskId: string
  targetTaskId: string
  relationshipType: "BLOCKS" | "DEPENDS_ON" | "SUBTASK" | "RELATED"
  createdAt: string
  createdById: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  projectId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectStats {
  ticketCount: number
  averageProgress: number
  projectId: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalElements: number
  totalPages: number
}
