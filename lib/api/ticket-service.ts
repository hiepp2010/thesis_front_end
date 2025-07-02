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

// Get auth token from localStorage - check multiple possible token names
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

    // Check cookies as fallback
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "accessToken" && value) {
        return value
      }
    }
  }
  return null
}

// Map our internal status to API status
const statusMap = {
  todo: "OPEN",
  "in-progress": "IN_PROGRESS",
  review: "RESOLVED",
  done: "CLOSED",
  reopened: "REOPENED",
}

// Map API status to our internal status
const reverseStatusMap = {
  OPEN: "todo",
  IN_PROGRESS: "in-progress",
  RESOLVED: "review",
  CLOSED: "done",
  REOPENED: "reopened",
}

// Map our internal priority to API priority
const priorityMap = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
}

// Map API priority to our internal priority
const reversePriorityMap = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "high",
}

// Transform API ticket to our internal format
const transformTicket = (apiTicket: any) => {
  return {
    id: apiTicket.id.toString(),
    title: apiTicket.title,
    description: apiTicket.description || "",
    status: reverseStatusMap[apiTicket.status] || "todo",
    priority: reversePriorityMap[apiTicket.priority] || "medium",
    assigneeId: apiTicket.assignee ? apiTicket.assignee.id.toString() : null,
    projectId: apiTicket.project.id.toString(),
    dueDate: apiTicket.dueDate || null,
    tags: apiTicket.tags || ["General"],
    createdAt: apiTicket.createdAt,
    updatedAt: apiTicket.updatedAt,
    completedPercentage: apiTicket.finishPercentage || 0,
  }
}

// Transform our internal ticket to API format for CREATE operations
const transformTicketToApiForCreate = (ticket: any) => {
  return {
    title: ticket.title,
    description: ticket.description,
    priority: priorityMap[ticket.priority] || "MEDIUM",
    projectId: Number.parseInt(ticket.projectId),
    assigneeId: ticket.assigneeId ? Number.parseInt(ticket.assigneeId) : null,
    dueDate: ticket.dueDate,
  }
}

// Transform our internal ticket to API format for UPDATE operations
const transformTicketToApiForUpdate = (ticket: any) => {
  return {
    title: ticket.title,
    description: ticket.description,
    status: statusMap[ticket.status] || "OPEN",
    priority: priorityMap[ticket.priority] || "MEDIUM",
    assigneeId: ticket.assigneeId ? Number.parseInt(ticket.assigneeId) : null,
    dueDate: ticket.dueDate,
    finishPercentage: ticket.completedPercentage || 0,
  }
}

export const ticketService = {
  // Get all tickets with pagination
  async getAllTickets(page = 0, size = 20, sort = "id,desc") {
    const token = getAuthToken()
    console.log("Making API call to get tickets, token exists:", !!token)

    const response = await fetch(`${API_URL}/tickets?page=${page}&size=${size}&sort=${sort}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    console.log("Tickets API response status:", response.status)
    const data = await handleResponse(response)
    return (data?.content || []).map(transformTicket)
  },

  // Get ticket by ID
  async getTicketById(id: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const ticket = await handleResponse(response)
    return transformTicket(ticket)
  },

  // Create new ticket
  async createTicket(ticketData: any) {
    const token = getAuthToken()
    const apiTicket = transformTicketToApiForCreate(ticketData)
    console.log("Creating ticket with data:", apiTicket)

    const response = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(apiTicket),
    })

    console.log("Create ticket response status:", response.status)
    const createdTicket = await handleResponse(response)
    return transformTicket(createdTicket)
  },

  // Update ticket
  async updateTicket(id: string, ticketData: any) {
    const token = getAuthToken()
    const apiTicket = transformTicketToApiForUpdate(ticketData)
    const response = await fetch(`${API_URL}/tickets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(apiTicket),
    })
    const updatedTicket = await handleResponse(response)
    return transformTicket(updatedTicket)
  },

  // Delete ticket
  async deleteTicket(id: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${id}`, {
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

  // Get tickets by project
  async getTicketsByProject(projectId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/project/${projectId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const tickets = await handleResponse(response)
    return Array.isArray(tickets) ? tickets.map(transformTicket) : []
  },

  // Get tickets by assignee
  async getTicketsByAssignee(assigneeId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/assignee/${assigneeId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const tickets = await handleResponse(response)
    return Array.isArray(tickets) ? tickets.map(transformTicket) : []
  },

  // Get tickets by status
  async getTicketsByStatus(status: string) {
    const token = getAuthToken()
    const apiStatus = statusMap[status] || status
    const response = await fetch(`${API_URL}/tickets/status/${apiStatus}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const tickets = await handleResponse(response)
    return Array.isArray(tickets) ? tickets.map(transformTicket) : []
  },

  // Search tickets
  async searchTickets(keyword: string, page = 0, size = 20) {
    const token = getAuthToken()
    const response = await fetch(
      `${API_URL}/tickets/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )
    const data = await handleResponse(response)
    return (data?.content || []).map(transformTicket)
  },

  // Assign ticket
  async assignTicket(ticketId: string, assigneeId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/assign/${assigneeId}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    const assignedTicket = await handleResponse(response)
    return transformTicket(assignedTicket)
  },

  // Update ticket status
  async updateTicketStatus(ticketId: string, status: string) {
    const token = getAuthToken()
    const apiStatus = statusMap[status] || status
    const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ status: apiStatus }),
    })
    const updatedTicket = await handleResponse(response)
    return transformTicket(updatedTicket)
  },

  // Update ticket progress
  async updateTicketProgress(ticketId: string, finishPercentage: number) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/progress`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ finishPercentage }),
    })
    const updatedTicket = await handleResponse(response)
    return transformTicket(updatedTicket)
  },

  // Get ticket statistics
  async getTicketStats(projectId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/stats/project/${projectId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get ticket priorities
  async getTicketPriorities() {
    const response = await fetch(`${API_URL}/tickets/priorities`)
    return handleResponse(response)
  },

  // Get ticket statuses
  async getTicketStatuses() {
    const response = await fetch(`${API_URL}/tickets/statuses`)
    return handleResponse(response)
  },

  // ===== TICKET COMMENTS =====

  // Get comments for ticket
  async getTicketComments(ticketId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get comments for ticket (paginated)
  async getTicketCommentsPaginated(ticketId: string, page = 0, size = 20, sort = "createdAt,desc") {
    const token = getAuthToken()
    const response = await fetch(
      `${API_URL}/tickets/${ticketId}/comments/paginated?page=${page}&size=${size}&sort=${sort}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )
    return handleResponse(response)
  },

  // Create comment on ticket
  async createTicketComment(ticketId: string, content: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ content }),
    })
    return handleResponse(response)
  },

  // Update comment
  async updateTicketComment(ticketId: string, commentId: string, content: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ content }),
    })
    return handleResponse(response)
  },

  // Delete comment
  async deleteTicketComment(ticketId: string, commentId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments/${commentId}`, {
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

  // Get comment count for ticket
  async getTicketCommentCount(ticketId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/${ticketId}/comments/count`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Search comments in ticket
  async searchTicketComments(ticketId: string, keyword: string, page = 0, size = 20) {
    const token = getAuthToken()
    const response = await fetch(
      `${API_URL}/tickets/${ticketId}/comments/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      },
    )
    return handleResponse(response)
  },

  // ===== TASK RELATIONSHIPS =====

  // Create task relationship
  async createTaskRelationship(
    sourceTaskId: string,
    targetTaskId: string,
    relationshipType: string,
    description?: string,
  ) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        sourceTaskId: Number.parseInt(sourceTaskId),
        targetTaskId: Number.parseInt(targetTaskId),
        relationshipType,
        description,
      }),
    })
    return handleResponse(response)
  },

  // Get relationships by task
  async getTaskRelationships(taskId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/task/${taskId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get outgoing relationships
  async getOutgoingRelationships(taskId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/task/${taskId}/outgoing`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get incoming relationships
  async getIncomingRelationships(taskId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/task/${taskId}/incoming`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get relationships by type
  async getRelationshipsByType(relationshipType: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/type/${relationshipType}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Delete relationship
  async deleteTaskRelationship(relationshipId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/${relationshipId}`, {
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

  // Get subtasks
  async getSubtasks(taskId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/task/${taskId}/subtasks`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get parent tasks
  async getParentTasks(taskId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/tickets/relationships/task/${taskId}/parents`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // ===== FILE ATTACHMENTS =====

  // Upload file to ticket
  async uploadFileToTicket(ticketId: string, file: File) {
    const token = getAuthToken()
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_URL}/files/ticket/${ticketId}/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })
    return handleResponse(response)
  },

  // Get ticket attachments
  async getTicketAttachments(ticketId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/files/ticket/${ticketId}/attachments`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Get file download URL
  async getFileDownloadUrl(ticketId: string, fileName: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/files/ticket/${ticketId}/download/${fileName}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
    return handleResponse(response)
  },

  // Delete ticket attachment
  async deleteTicketAttachment(ticketId: string, attachmentId: string) {
    const token = getAuthToken()
    const response = await fetch(`${API_URL}/files/ticket/${ticketId}/attachment/${attachmentId}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })

    if (response.status === 200) {
      return handleResponse(response)
    }

    return true
  },
}
