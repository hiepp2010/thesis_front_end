"use client"

import { useState, useCallback } from "react"
import { relationshipService } from "../api/relationship-service"
import { useApi } from "./useApi"

export function useTaskRelationships(taskId: string) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { data, isLoading, error } = useApi(
    () => relationshipService.getRelationships(taskId),
    [taskId, refreshTrigger],
  )

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const createRelationship = useCallback(
    async (targetTaskId: string, type: string) => {
      await relationshipService.createRelationship(taskId, targetTaskId, type)
      refresh()
    },
    [taskId, refresh],
  )

  const deleteRelationship = useCallback(
    async (relationshipId: string) => {
      await relationshipService.deleteRelationship(relationshipId)
      refresh()
    },
    [refresh],
  )

  return {
    relationships: data || [],
    isLoading,
    error,
    refresh,
    createRelationship,
    deleteRelationship,
  }
}
