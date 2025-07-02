import { apiClient } from "../api-client"

// Transform API relationship to our internal format
const transformRelationship = (apiRelationship: any) => {
  return {
    id: apiRelationship.id.toString(),
    sourceTaskId: apiRelationship.sourceTask.id.toString(),
    targetTaskId: apiRelationship.targetTask.id.toString(),
    type: apiRelationship.relationshipType,
    createdAt: apiRelationship.createdAt,
    createdBy: apiRelationship.createdBy
      ? {
          id: apiRelationship.createdBy.id.toString(),
          name: apiRelationship.createdBy.username,
        }
      : null,
  }
}

export const relationshipService = {
  // Create a new task relationship
  async createRelationship(sourceTaskId: string, targetTaskId: string, type: string) {
    try {
      const response = await apiClient.post("/tickets/relationships", {
        sourceTaskId: Number.parseInt(sourceTaskId),
        targetTaskId: Number.parseInt(targetTaskId),
        relationshipType: type,
      })
      return transformRelationship(response)
    } catch (error) {
      console.error("Failed to create relationship:", error)
      throw error
    }
  },

  // Get all relationships for a task
  async getRelationships(taskId: string) {
    try {
      const response = await apiClient.get(`/tickets/relationships/task/${taskId}`)
      return Array.isArray(response) ? response.map(transformRelationship) : []
    } catch (error) {
      console.error(`Failed to fetch relationships for task ${taskId}:`, error)
      throw error
    }
  },

  // Get outgoing relationships for a task
  async getOutgoingRelationships(taskId: string) {
    try {
      const response = await apiClient.get(`/tickets/relationships/task/${taskId}/outgoing`)
      return Array.isArray(response) ? response.map(transformRelationship) : []
    } catch (error) {
      console.error(`Failed to fetch outgoing relationships for task ${taskId}:`, error)
      throw error
    }
  },

  // Get incoming relationships for a task
  async getIncomingRelationships(taskId: string) {
    try {
      const response = await apiClient.get(`/tickets/relationships/task/${taskId}/incoming`)
      return Array.isArray(response) ? response.map(transformRelationship) : []
    } catch (error) {
      console.error(`Failed to fetch incoming relationships for task ${taskId}:`, error)
      throw error
    }
  },

  // Get subtasks for a task
  async getSubtasks(taskId: string) {
    try {
      const response = await apiClient.get(`/tickets/relationships/task/${taskId}/subtasks`)
      return Array.isArray(response) ? response.map(transformRelationship) : []
    } catch (error) {
      console.error(`Failed to fetch subtasks for task ${taskId}:`, error)
      throw error
    }
  },

  // Get parent tasks for a task
  async getParentTasks(taskId: string) {
    try {
      const response = await apiClient.get(`/tickets/relationships/task/${taskId}/parents`)
      return Array.isArray(response) ? response.map(transformRelationship) : []
    } catch (error) {
      console.error(`Failed to fetch parent tasks for task ${taskId}:`, error)
      throw error
    }
  },

  // Delete a relationship
  async deleteRelationship(relationshipId: string) {
    try {
      await apiClient.delete(`/tickets/relationships/${relationshipId}`)
      return true
    } catch (error) {
      console.error(`Failed to delete relationship ${relationshipId}:`, error)
      throw error
    }
  },

  // Get all blocked tasks
  async getBlockedTasks() {
    try {
      const response = await apiClient.get("/tickets/relationships/blocked-tasks")
      return Array.isArray(response) ? response.map(transformRelationship) : []
    } catch (error) {
      console.error("Failed to fetch blocked tasks:", error)
      throw error
    }
  },

  // Get relationship types
  async getRelationshipTypes() {
    try {
      return await apiClient.get("/tickets/relationships/types")
    } catch (error) {
      console.error("Failed to fetch relationship types:", error)
      throw error
    }
  },
}
