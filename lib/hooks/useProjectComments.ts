"use client"

import { useState, useCallback } from "react"
import { projectService } from "../api/project-service"
import { useApi } from "./useApi"

export function useProjectComments(projectId: string) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { data, isLoading, error } = useApi(
    () => projectService.getProjectComments(projectId),
    [projectId, refreshTrigger],
  )

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const addComment = useCallback(
    async (content: string) => {
      await projectService.addComment(projectId, content)
      refresh()
    },
    [projectId, refresh],
  )

  return {
    comments: data || [],
    isLoading,
    error,
    refresh,
    addComment,
  }
}
