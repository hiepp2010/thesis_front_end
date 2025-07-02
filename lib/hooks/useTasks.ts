import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { taskApi } from "../api"
import type { Task, TaskStatus, TaskPriority } from "../data"

// Hook to get tasks with filters
export function useTasks(filters?: {
  projectId?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  search?: string
}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => taskApi.getTasks(filters),
  })
}

// Hook to get a specific task
export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => taskApi.getTask(id),
    enabled: !!id,
  })
}

// Hook to create a task
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

// Hook to update a task
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) => taskApi.updateTask(id, updates),
    onSuccess: (data, variables) => {
      // Update the specific task in cache
      queryClient.setQueryData(["task", variables.id], data)
      // Invalidate tasks list
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}

// Hook to delete a task
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}
