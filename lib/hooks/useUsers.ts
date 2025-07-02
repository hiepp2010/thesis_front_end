"use client"

import { useState, useCallback } from "react"
import { userService } from "../api/user-service"
import { useApi } from "./useApi"

export function useUsers() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { data, isLoading, error } = useApi(() => userService.getUsers(), [refreshTrigger])

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  const getUser = useCallback(async (id: string) => {
    return userService.getUser(id)
  }, [])

  const updateUser = useCallback(
    async (id: string, updates: any) => {
      await userService.updateUser(id, updates)
      refresh()
    },
    [refresh],
  )

  return {
    users: data || [],
    isLoading,
    error,
    refresh,
    getUser,
    updateUser,
  }
}
