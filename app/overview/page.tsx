"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle2, Clock, ListTodo, Plus, Search, Users } from "lucide-react"
import { useProjects } from "@/lib/hooks/useProjects"
import { useUsers } from "@/lib/hooks/useUsers"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"

export default function TaskFlowOverview() {
  const { user } = useAuth()
  const { projects, isLoading: projectsLoading } = useProjects()
  const { users, isLoading: usersLoading } = useUsers()
  const [allTickets, setAllTickets] = useState<any[]>([])
  const [isLoadingTickets, setIsLoadingTickets] = useState(true)
  const [ticketError, setTicketError] = useState<string | null>(null)

  // Fetch tickets assigned to current user
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (!user?.id) {
        console.log("No user ID, skipping ticket fetch")
        setIsLoadingTickets(false)
        return
      }

      try {
        console.log("Starting to fetch tickets for user:", user.id)
        setIsLoadingTickets(true)
        setTicketError(null)

        // Add timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.log("Ticket fetch timeout after 10 seconds")
          setTicketError("Request timeout - taking too long to load tickets")
          setIsLoadingTickets(false)
        }, 10000)

        // Replace this section:
        // Use the ticket service API to get tickets assigned to current user
        // const { ticketService } = await import("@/lib/api/ticket-service")
        // console.log("Calling ticketService.getTicketsByAssignee...")

        // const userTickets = await ticketService.getTicketsByAssignee(user.id.toString())

        // With this:
        // Use the direct API endpoint to get tickets assigned to current user
        const response = await fetch(`/api/tickets/assignee/${user.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`)
        }

        const userTickets = await response.json()

        clearTimeout(timeoutId)
        console.log("Successfully fetched tickets:", userTickets.length)

        // Add project names to tickets
        const ticketsWithProjects = userTickets.map((ticket: any) => {
          const project = projects.find((p) => p.id.toString() === ticket.projectId)
          return {
            ...ticket,
            projectName: project?.name || "Unknown Project",
          }
        })

        setAllTickets(ticketsWithProjects)
      } catch (error) {
        console.error("Error fetching user tickets:", error)
        setTicketError(error instanceof Error ? error.message : "Failed to load tickets")
        setAllTickets([])
      } finally {
        setIsLoadingTickets(false)
      }
    }

    // Only fetch if we have user and projects are loaded
    if (user?.id && !projectsLoading) {
      fetchUserTickets()
    } else if (!user?.id) {
      setIsLoadingTickets(false)
    }
  }, [user?.id, projectsLoading]) // Removed projects from dependencies to prevent infinite loop

  // Calculate stats from real data
  const completedTasks = allTickets.filter((task) => task.status === "done").length
  const inProgressTasks = allTickets.filter((task) => task.status === "in-progress").length
  const todoTasks = allTickets.filter((task) => task.status === "todo").length
  const reviewTasks = allTickets.filter((task) => task.status === "review").length

  // Get recent tasks (sorted by updatedAt)
  const recentTasks = [...allTickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)

  // Calculate project progress
  const projectsWithProgress = projects.map((project) => {
    const projectTickets = allTickets.filter((ticket) => ticket.projectId === project.id.toString())
    const completedTickets = projectTickets.filter((ticket) => ticket.status === "done").length
    const progress = projectTickets.length > 0 ? Math.round((completedTickets / projectTickets.length) * 100) : 0

    return {
      ...project,
      progress,
      status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "planning",
    }
  })

  // Show loading state
  if (projectsLoading || usersLoading || isLoadingTickets) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your workspace...</p>
            {isLoadingTickets && <p className="mt-2 text-sm text-gray-500">Fetching your assigned tickets...</p>}
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
            className="flex items-center gap-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-xl shadow-md transform transition-all duration-200 hover:scale-105"
          >
            <BarChart3 size={18} />
            <span className="font-medium">Overview</span>
          </Link>
          <Link
            href="/board"
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <ListTodo size={18} />
            <span>Board</span>
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

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Overall Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Completed Tasks</span>
              <span className="font-medium">
                {completedTasks}/{allTickets.length}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${allTickets.length > 0 ? (completedTasks / allTickets.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
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
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="md:hidden">
                  <ListTodo size={18} />
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 h-9 w-[200px] md:w-[300px] rounded-md border border-gray-200 bg-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.username || "User"}!</h1>
            <p className="text-gray-600">Here's what's happening with your projects today.</p>
          </div>

          {/* Show error if ticket loading failed */}
          {ticketError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                <strong>Error loading tickets:</strong> {ticketError}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Projects</p>
                    <p className="text-3xl font-bold">{projects.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <ListTodo className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-3xl font-bold">{inProgressTasks}</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-3xl font-bold">{completedTasks}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Team Members</p>
                    <p className="text-3xl font-bold">{users.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <Button variant="outline" size="sm">
                <Link href="/board">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectsWithProgress.slice(0, 3).map((project) => (
                <Card key={project.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          project.status === "in-progress"
                            ? "bg-blue-500"
                            : project.status === "planning"
                              ? "bg-amber-500"
                              : "bg-green-500"
                        }
                      >
                        {project.status === "in-progress"
                          ? "In Progress"
                          : project.status === "planning"
                            ? "Planning"
                            : "Completed"}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{project.name}</CardTitle>
                    <p className="text-sm text-gray-600">{project.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.status === "in-progress"
                              ? "bg-blue-500"
                              : project.status === "planning"
                                ? "bg-amber-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 3).map((member: any, index: number) => (
                          <Avatar key={member.id || index} className="h-7 w-7 border-2 border-white">
                            <AvatarImage src={member.avatar || "/diverse-person-portrait.png"} alt={member.username} />
                            <AvatarFallback>{member.username?.charAt(0).toUpperCase() || "M"}</AvatarFallback>
                          </Avatar>
                        ))}
                        {project.members && project.members.length > 3 && (
                          <div className="h-7 w-7 border-2 border-white rounded-full bg-gray-100 flex items-center justify-center text-xs">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {project.createdAt
                          ? `Created ${new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : "No date"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Recent Tasks</h2>
              <Button variant="outline" size="sm">
                <Link href="/board">View All</Link>
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                {recentTasks.length > 0 ? (
                  <div className="divide-y">
                    {recentTasks.map((task) => {
                      const assignee = users.find(
                        (user) => user.id === task.assignee?.id || user.id === task.assigneeId,
                      )
                      return (
                        <div key={task.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-md ${
                                task.priority === "high"
                                  ? "bg-red-100"
                                  : task.priority === "medium"
                                    ? "bg-amber-100"
                                    : "bg-blue-100"
                              }`}
                            >
                              <ListTodo
                                className={`h-5 w-5 ${
                                  task.priority === "high"
                                    ? "text-red-600"
                                    : task.priority === "medium"
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                }`}
                              />
                            </div>
                            <div>
                              <p
                                className={`font-medium ${task.status === "done" ? "line-through text-gray-500" : ""}`}
                              >
                                {task.title}
                              </p>
                              <p className="text-sm text-gray-500">{task.projectName || "Unknown Project"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge
                              variant="outline"
                              className={
                                task.priority === "high"
                                  ? "text-red-500 border-red-200 bg-red-50"
                                  : task.priority === "medium"
                                    ? "text-amber-500 border-amber-200 bg-amber-50"
                                    : "text-blue-500 border-blue-200 bg-blue-50"
                              }
                            >
                              {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || "Low"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {task.dueDate
                                ? `Due ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                : "No due date"}
                            </span>
                            {assignee && (
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.username} />
                                <AvatarFallback>{assignee.username?.charAt(0).toUpperCase()}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <ListTodo className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No tasks found</p>
                    <p className="text-sm">
                      {ticketError
                        ? "Unable to load your tasks"
                        : "Create your first project and add some tasks to get started!"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
