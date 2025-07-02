"use client"

import { useState, useEffect, useCallback } from "react"
import { projectService } from "../api/project-service"
import { useAuth } from "@/components/auth-provider"

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Use the recommended approach for regular users
      const result = await projectService.getAllProjects()
      setProjects(result)
    } catch (err) {
      setError(err)
      console.error("Error fetching projects:", err)

      // If we get a 403 error, it means we tried to access admin endpoint
      if (err.message.includes("403")) {
        console.warn("Access denied to admin endpoint, this is expected for regular users")
        setProjects([])
      }
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(async (projectData) => {
    setIsLoading(true)
    try {
      const newProject = await projectService.createProject(projectData)
      setProjects((prev) => [...prev, newProject])
      return newProject
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProject = useCallback(async (projectId, projectData) => {
    setIsLoading(true)
    try {
      const updatedProject = await projectService.updateProject(projectId, projectData)
      setProjects((prev) => prev.map((project) => (project.id === projectId ? updatedProject : project)))
      return updatedProject
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteProject = useCallback(async (projectId) => {
    setIsLoading(true)
    try {
      await projectService.deleteProject(projectId)
      setProjects((prev) => prev.filter((project) => project.id !== projectId))
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addMemberToProject = useCallback(async (projectId, memberId) => {
    setIsLoading(true)
    try {
      const updatedProject = await projectService.addMemberToProject(projectId, memberId)
      setProjects((prev) => prev.map((project) => (project.id === projectId ? updatedProject : project)))
      return updatedProject
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeMemberFromProject = useCallback(async (projectId, memberId) => {
    setIsLoading(true)
    try {
      const updatedProject = await projectService.removeMemberFromProject(projectId, memberId)
      setProjects((prev) => prev.map((project) => (project.id === projectId ? updatedProject : project)))
      return updatedProject
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get projects owned by current user
  const getOwnedProjects = useCallback(async () => {
    if (!user?.id) return []
    try {
      return await projectService.getCurrentUserOwnedProjects()
    } catch (err) {
      console.error("Error fetching owned projects:", err)
      return []
    }
  }, [user?.id])

  // Get projects where current user is a member
  const getMemberProjects = useCallback(async () => {
    if (!user?.id) return []
    try {
      return await projectService.getCurrentUserMemberProjects()
    } catch (err) {
      console.error("Error fetching member projects:", err)
      return []
    }
  }, [user?.id])

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    addMemberToProject,
    removeMemberFromProject,
    getOwnedProjects,
    getMemberProjects,
  }
}
