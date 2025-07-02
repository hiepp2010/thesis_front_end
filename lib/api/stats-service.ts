import { apiClient } from "../api-client"

export const statsService = {
  // Get ticket count by status
  async getTicketCountByStatus(status: string) {
    try {
      const response = await apiClient.get(`/tickets/stats/status/${status}`)
      return {
        count: response.count,
        status: response.status,
      }
    } catch (error) {
      console.error(`Failed to fetch ticket count for status ${status}:`, error)
      throw error
    }
  },

  // Get open tickets by assignee
  async getOpenTicketsByAssignee(assigneeId: string) {
    try {
      const response = await apiClient.get(`/tickets/stats/assignee/${assigneeId}/open`)
      return {
        openTickets: response.openTickets,
        assigneeId: response.assigneeId.toString(),
      }
    } catch (error) {
      console.error(`Failed to fetch open tickets for assignee ${assigneeId}:`, error)
      throw error
    }
  },

  // Get project statistics
  async getProjectStatistics(projectId: string) {
    try {
      const response = await apiClient.get(`/tickets/stats/project/${projectId}`)
      return {
        ticketCount: response.ticketCount,
        averageProgress: response.averageProgress,
        projectId: response.projectId.toString(),
      }
    } catch (error) {
      console.error(`Failed to fetch statistics for project ${projectId}:`, error)
      throw error
    }
  },

  // Get dashboard statistics
  async getDashboardStatistics() {
    try {
      // Fetch multiple statistics in parallel
      const [openTickets, inProgressTickets, resolvedTickets, closedTickets] = await Promise.all([
        this.getTicketCountByStatus("OPEN"),
        this.getTicketCountByStatus("IN_PROGRESS"),
        this.getTicketCountByStatus("RESOLVED"),
        this.getTicketCountByStatus("CLOSED"),
      ])

      return {
        openTickets: openTickets.count,
        inProgressTickets: inProgressTickets.count,
        resolvedTickets: resolvedTickets.count,
        closedTickets: closedTickets.count,
        totalTickets: openTickets.count + inProgressTickets.count + resolvedTickets.count + closedTickets.count,
      }
    } catch (error) {
      console.error("Failed to fetch dashboard statistics:", error)
      throw error
    }
  },
}
