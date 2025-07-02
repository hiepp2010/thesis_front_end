import { create } from "zustand"

// Types - these should already be defined in this file
export type TaskStatus = "todo" | "in-progress" | "review" | "done" | "reopened"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  projectId: string
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  completedPercentage: number
}

export interface Project {
  id: string
  name: string
  description: string
  progress: number
  status: "planning" | "in-progress" | "completed"
  dueDate: string | null
}

export interface User {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  avatar: string
  availability: "Available" | "In a meeting" | "Busy" | "On vacation"
}

// Remove all mock data arrays and functions since we're using real API data now
// Keep only the Zustand store and helper functions that work with real data

// Store interface
interface TaskStore {
  tasks: Task[]
  projects: Project[]
  users: User[]
  filteredTasks: Task[]
  searchQuery: string
  priorityFilter: TaskPriority | "all"
  tagFilter: string | "all"
  assigneeFilter: string | "all"

  // Actions
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedPercentage">) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  setSearchQuery: (query: string) => void
  setPriorityFilter: (priority: TaskPriority | "all") => void
  setTagFilter: (tag: string | "all") => void
  setAssigneeFilter: (assigneeId: string | "all") => void
  clearFilters: () => void
}

// Create store - initialize with empty arrays since we'll load from API
export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  projects: [],
  users: [],
  filteredTasks: [],
  searchQuery: "",
  priorityFilter: "all",
  tagFilter: "all",
  assigneeFilter: "all",

  // Actions remain the same but work with real data
  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedPercentage: 0,
    }

    set((state) => {
      const updatedTasks = [...state.tasks, newTask]
      return {
        tasks: updatedTasks,
        filteredTasks: applyFilters(
          updatedTasks,
          state.searchQuery,
          state.priorityFilter,
          state.tagFilter,
          state.assigneeFilter,
        ),
      }
    })
  },

  updateTask: (taskId, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
      )

      return {
        tasks: updatedTasks,
        filteredTasks: applyFilters(
          updatedTasks,
          state.searchQuery,
          state.priorityFilter,
          state.tagFilter,
          state.assigneeFilter,
        ),
      }
    })
  },

  deleteTask: (taskId) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((task) => task.id !== taskId)

      return {
        tasks: updatedTasks,
        filteredTasks: applyFilters(
          updatedTasks,
          state.searchQuery,
          state.priorityFilter,
          state.tagFilter,
          state.assigneeFilter,
        ),
      }
    })
  },

  moveTask: (taskId, newStatus) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              completedPercentage: newStatus === "done" ? 100 : task.completedPercentage,
            }
          : task,
      )

      return {
        tasks: updatedTasks,
        filteredTasks: applyFilters(
          updatedTasks,
          state.searchQuery,
          state.priorityFilter,
          state.tagFilter,
          state.assigneeFilter,
        ),
      }
    })
  },

  setSearchQuery: (query) => {
    set((state) => ({
      searchQuery: query,
      filteredTasks: applyFilters(state.tasks, query, state.priorityFilter, state.tagFilter, state.assigneeFilter),
    }))
  },

  setPriorityFilter: (priority) => {
    set((state) => ({
      priorityFilter: priority,
      filteredTasks: applyFilters(state.tasks, state.searchQuery, priority, state.tagFilter, state.assigneeFilter),
    }))
  },

  setTagFilter: (tag) => {
    set((state) => ({
      tagFilter: tag,
      filteredTasks: applyFilters(state.tasks, state.searchQuery, state.priorityFilter, tag, state.assigneeFilter),
    }))
  },

  setAssigneeFilter: (assigneeId) => {
    set((state) => ({
      assigneeFilter: assigneeId,
      filteredTasks: applyFilters(state.tasks, state.searchQuery, state.priorityFilter, state.tagFilter, assigneeId),
    }))
  },

  clearFilters: () => {
    set((state) => ({
      searchQuery: "",
      priorityFilter: "all",
      tagFilter: "all",
      assigneeFilter: "all",
      filteredTasks: state.tasks,
    }))
  },
}))

// Helper function to apply filters
function applyFilters(
  tasks: Task[],
  searchQuery: string,
  priorityFilter: TaskPriority | "all",
  tagFilter: string | "all",
  assigneeFilter: string | "all",
): Task[] {
  return tasks.filter((task) => {
    // Search query filter
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    // Priority filter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    // Tag filter
    const matchesTag = tagFilter === "all" || task.tags.includes(tagFilter)

    // Assignee filter
    const matchesAssignee = assigneeFilter === "all" || task.assigneeId === assigneeFilter

    return matchesSearch && matchesPriority && matchesTag && matchesAssignee
  })
}

// Helper function to get all unique tags from tasks
export function getAllTags(tasks: Task[]): string[] {
  const tagsSet = new Set<string>()
  tasks.forEach((task) => {
    task.tags.forEach((tag) => tagsSet.add(tag))
  })
  return Array.from(tagsSet)
}
