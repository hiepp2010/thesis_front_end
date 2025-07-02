import { useApi } from "./useApi"
import { statsService } from "../api/stats-service"

export function useProjectStats(projectId: string) {
  const { data, isLoading, error } = useApi(() => statsService.getProjectStatistics(projectId), [projectId])

  return {
    stats: data,
    isLoading,
    error,
  }
}

export function useDashboardStats() {
  const { data, isLoading, error } = useApi(() => statsService.getDashboardStatistics(), [])

  return {
    stats: data,
    isLoading,
    error,
  }
}
