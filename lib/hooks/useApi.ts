"use client"

import { useState, useEffect } from "react"

export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await apiCall()

        if (!isCancelled) {
          setData(result)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err : new Error("An error occurred"))
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, dependencies)

  return { data, isLoading, error }
}
