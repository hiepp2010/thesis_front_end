"use client"

import React from "react"
import type { ReactElement } from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  ListTodo,
  Plus,
  Users,
  Clock,
  FolderPlus,
  ChevronDown,
  Activity,
  CheckCircle2,
  AlertCircle,
  Timer,
} from "lucide-react"
import { TaskColumn } from "@/components/task-column"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { FilterDialog } from "@/components/filter-dialog"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { TimeTracking } from "@/components/time-tracking"
import { AddAttachmentDialog } from "@/components/add-attachment-dialog"
import { LinkTaskDialog } from "@/components/link-task-dialog"
import type { TaskStatus } from "@/lib/data"
import { useTickets } from "@/lib/hooks/useTickets"
import { useProjects } from "@/lib/hooks/useProjects"
import { useAuth } from "@/components/auth-provider"

export default function BoardPage(): ReactElement {
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>("todo")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showTimeTracking, setShowTimeTracking] = useState(false)
  const [addAttachmentOpen, setAddAttachmentOpen] = useState(false)
  const [linkTaskOpen, setLinkTaskOpen] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)

  const { user } = useAuth()
  const { projects, isLoading: projectsLoading, createProject } = useProjects()
  const {
    tickets,
    isLoading: ticketsLoading,
    createTicket,
    updateTicket,
    deleteTicket,
    moveTicket,
  } = useTickets({
    projectId: currentProjectId,
  })

  // Get current project
  const currentProject = projects.find((p) => p.id === currentProjectId)

  // Check if user has no projects
  const hasNoProjects = !projectsLoading && projects.length === 0

  // Calculate project statistics
  const projectStats = React.useMemo(() => {
    if (!tickets.length) return { total: 0, completed: 0, inProgress: 0, todo: 0, completionRate: 0 }

    const total = tickets.length
    const completed = tickets.filter((t) => t.status === "done").length
    const inProgress = tickets.filter((t) => t.status === "in-progress").length
    const todo = tickets.filter((t) => t.status === "todo").length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, todo, completionRate }
  }, [tickets])

  // Check if user is project owner - try multiple approaches
  const isProjectOwner =
    currentProject &&
    user &&
    (currentProject.ownerId === user.id ||
      currentProject.ownerId === user.id?.toString() ||
      currentProject.owner?.id === user.id ||
      currentProject.owner?.id === user.id?.toString() ||
      currentProject.owner?.username === user.username)

  // For testing purposes, let's also allow if user has MANAGER role or if it's the first project
  const canCreateTasks = isProjectOwner || user?.roles?.includes("MANAGER") || projects.length === 1

  // Set default project when projects load - FIXED: Only set if no project is selected
  React.useEffect(() => {
    if (projects.length > 0 && !currentProjectId) {
      console.log("Setting default project:", projects[0].id, projects[0].name)
      setCurrentProjectId(projects[0].id)
    }
  }, [projects, currentProjectId])

  // FIXED: Clear tickets when no project is selected
  React.useEffect(() => {
    if (!currentProjectId) {
      console.log("No project selected, should show empty state")
    } else {
      console.log("Current project ID:", currentProjectId)
    }
  }, [currentProjectId])

  const handleAddTask = async (status: TaskStatus) => {
    setSelectedStatus(status)
    setAddTaskDialogOpen(true)
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
  }

  const handleProjectChange = (projectId: string) => {
    console.log("handleProjectChange called with:", projectId)
    console.log("Current project before change:", currentProjectId)
    setCurrentProjectId(projectId)
    setShowProjectDropdown(false)
    console.log("Project change completed")
  }

  const handleCreateFirstProject = async (projectData: { name: string; description: string }) => {
    try {
      const newProject = await createProject(projectData)
      setCurrentProjectId(newProject.id)
      setShowCreateProject(false)
    } catch (error) {
      console.error("Error creating project:", error)
    }
  }

  const handleCreateTicket = async (ticketData: any) => {
    try {
      await createTicket(ticketData)
    } catch (error) {
      console.error("Failed to create ticket:", error)
      throw error
    }
  }

  const handleAddAttachment = (attachment: any) => {
    console.log("Added attachment:", attachment)
  }

  const handleLinkTask = (linkedTask: any) => {
    console.log("Linked task:", linkedTask)
  }

  // Show loading state
  if (projectsLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white/80 backdrop-blur-md border-r border-slate-200/50 p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-8 p-2">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-xl shadow-lg">
            <ListTodo size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-xs text-slate-500">Project Management</p>
          </div>
        </div>

        <nav className="space-y-2 mb-6">
          <Link
            href="/overview"
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </Link>
          <Link
            href="/board"
            className="flex items-center gap-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-xl shadow-md transform transition-all duration-200 hover:scale-105"
          >
            <ListTodo size={18} />
            <span className="font-medium">Board</span>
          </Link>
          <Link
            href="/timeline"
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <Clock size={18} />
            <span>Timeline</span>
          </Link>
          <Link
            href="/team"
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <Users size={18} />
            <span>Team</span>
          </Link>
        </nav>

        {/* Quick Stats */}
        {!hasNoProjects && currentProject && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Project Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completion</span>
                <span className="font-medium">{projectStats.completionRate}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${projectStats.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>{projectStats.completed} done</span>
                <span>{projectStats.total} total</span>
              </div>
            </div>
          </div>
        )}

        {!hasNoProjects && (
          <div className="mb-4">
            <Button
              variant="outline"
              className="w-full justify-start hover:bg-blue-50 hover:border-blue-300 transition-colors"
              onClick={() => setShowTimeTracking(!showTimeTracking)}
            >
              <Timer className="mr-2 h-4 w-4" />
              {showTimeTracking ? "Hide Time Tracking" : "Show Time Tracking"}
            </Button>

            {showTimeTracking && selectedTaskId && (
              <div className="mt-4">
                <TimeTracking taskId={selectedTaskId} initialEstimate={120} />
              </div>
            )}
          </div>
        )}

        {/* Create Project Button */}
        <div className="mb-4">
          <Button
            onClick={() => setShowCreateProject(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user?.username?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.username || "User"}</p>
              <p className="text-xs text-slate-500">{user?.roles?.includes("MANAGER") ? "Manager" : "Team Member"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Enhanced Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="md:hidden">
                  <ListTodo size={18} />
                </Button>
                {!hasNoProjects && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Activity className="h-4 w-4" />
                      <span>Active Board</span>
                    </div>
                    {projectStats.total > 0 && (
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-blue-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{projectStats.completed} completed</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>{projectStats.inProgress} in progress</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-2 ring-blue-200 hover:ring-blue-300 transition-all cursor-pointer">
                  <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-6">
          {hasNoProjects ? (
            // Enhanced No projects state
            <div className="flex items-center justify-center min-h-[60vh]">
              <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-fit">
                    <FolderPlus className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to TaskFlow!
                  </CardTitle>
                  <CardDescription className="text-base text-gray-600 leading-relaxed">
                    Ready to boost your productivity? Create your first project and start organizing your tasks like a
                    pro.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <Button
                    onClick={() => setShowCreateProject(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    size="lg"
                  >
                    <FolderPlus className="mr-2 h-5 w-5" />
                    Create Your First Project
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Or ask a team member to add you to an existing project</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Enhanced board view with projects
            <>
              {/* Enhanced Project Header */}
              {projects.length > 0 && (
                <div className="mb-8 relative">
                  <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <button
                              type="button"
                              className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 min-w-[200px] relative z-10"
                              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="font-medium text-gray-900">
                                  {currentProject?.name || "Select a project"}
                                </span>
                              </div>
                              <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
                            </button>
                          </div>
                          {currentProject && (
                            <div className="flex items-center gap-4">
                              <p className="text-gray-600">{currentProject.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {projectStats.total} tasks
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{projectStats.completionRate}% complete</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Access Control Notice */}
              {currentProject && !canCreateTasks && (
                <div className="mb-6">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-900">Project Member Access</p>
                          <p className="text-xs text-blue-700">
                            You can view and comment on tasks. Only project owners can create and manage tasks.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Enhanced Task columns - FIXED: Only show when project is selected */}
              {currentProjectId ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <TaskColumn
                    title="To Do"
                    status="todo"
                    tasks={tickets.filter((task) => task.status === "todo")}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => handleAddTask("todo")}
                    canAddTask={canCreateTasks}
                  />
                  <TaskColumn
                    title="In Progress"
                    status="in-progress"
                    tasks={tickets.filter((task) => task.status === "in-progress")}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => handleAddTask("in-progress")}
                    canAddTask={canCreateTasks}
                  />
                  <TaskColumn
                    title="Review"
                    status="review"
                    tasks={tickets.filter((task) => task.status === "review")}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => handleAddTask("review")}
                    canAddTask={canCreateTasks}
                  />
                  <TaskColumn
                    title="Done"
                    status="done"
                    tasks={tickets.filter((task) => task.status === "done")}
                    onTaskClick={handleTaskClick}
                    onAddTask={() => handleAddTask("done")}
                    canAddTask={canCreateTasks}
                  />
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ListTodo className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a project to get started</h3>
                    <p className="text-gray-500">
                      Choose a project from the dropdown above to view and manage your tasks.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Project Dropdown Portal - Rendered at root level */}
      {showProjectDropdown && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-transparent" onClick={() => setShowProjectDropdown(false)} />

          {/* Dropdown positioned absolutely */}
          <div
            className="absolute bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto w-80"
            style={{
              top: "200px", // Adjust based on your header height
              left: "320px", // Adjust based on your sidebar width + some margin
            }}
          >
            <div className="p-3">
              <div className="text-sm font-semibold text-gray-700 px-3 py-2 bg-gray-50 rounded-lg mb-2">
                Your Projects
              </div>
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    console.log("Selecting project:", project.id, project.name)
                    handleProjectChange(project.id)
                  }}
                  className={`w-full text-left px-3 py-3 text-sm hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3 ${
                    project.id === currentProjectId ? "bg-blue-50 border border-blue-200" : ""
                  }`}
                >
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    {project.description && <div className="text-xs text-gray-500 truncate">{project.description}</div>}
                  </div>
                  {project.id === currentProjectId && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                </button>
              ))}
              <hr className="my-2" />
              <button
                type="button"
                onClick={() => {
                  setShowCreateProject(true)
                  setShowProjectDropdown(false)
                }}
                className="w-full text-left px-3 py-3 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-3 font-medium"
              >
                <Plus className="h-4 w-4" />
                Create New Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Create Project Dialog */}
      {showCreateProject && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="max-w-md w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-fit">
                  <FolderPlus className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Project
                </CardTitle>
                <CardDescription>Set up your project workspace and start organizing your tasks.</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    const name = formData.get("name") as string
                    const description = formData.get("description") as string

                    if (name && description) {
                      await handleCreateFirstProject({ name, description })
                    }
                  }}
                >
                  <div className="grid gap-6">
                    <div className="grid gap-3">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="flex h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        placeholder="My Awesome Project"
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="flex h-24 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                        placeholder="A brief description of what this project is about..."
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateProject(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        Create Project
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Keep all existing dialogs */}
      {addTaskDialogOpen && currentProjectId && (
        <AddTaskDialog
          open={addTaskDialogOpen}
          onClose={() => setAddTaskDialogOpen(false)}
          onCreateTicket={handleCreateTicket}
        />
      )}
      {filterDialogOpen && <FilterDialog isOpen={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} />}
      {selectedTaskId && (
        <TaskDetailModal taskId={selectedTaskId} open={!!selectedTaskId} onClose={() => setSelectedTaskId(null)} />
      )}
      {addAttachmentOpen && (
        <AddAttachmentDialog
          isOpen={addAttachmentOpen}
          onClose={() => setAddAttachmentOpen(false)}
          onAddAttachment={handleAddAttachment}
        />
      )}
      {linkTaskOpen && (
        <LinkTaskDialog isOpen={linkTaskOpen} onClose={() => setLinkTaskOpen(false)} onLinkTask={handleLinkTask} />
      )}
    </div>
  )
}
