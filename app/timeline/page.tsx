"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  ListTodo,
  Plus,
  Search,
  Users,
} from "lucide-react"
import { useProjects } from "@/lib/hooks/useProjects"
import { useTickets } from "@/lib/hooks/useTickets"
import { useAuth } from "@/components/auth-provider"
import { TaskDetailModal } from "@/components/task-detail-modal"

export default function TimelinePage() {
  const { user } = useAuth()
  const { projects } = useProjects()
  const { tickets } = useTickets()
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)

  // Generate weeks (4 weeks per month for 5 months = 20 weeks)
  const months = ["May", "June", "July", "August", "September"]
  const weeks = []
  for (let i = 0; i < 20; i++) {
    const monthIndex = Math.floor(i / 4)
    const weekNum = (i % 4) + 1
    weeks.push(`${months[monthIndex]} W${weekNum}`)
  }

  // Set default project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id.toString())
    }
  }, [projects, selectedProjectId])

  // Generate timeline data based on selected project and real tickets
  useEffect(() => {
    if (!selectedProjectId || !tickets.length) {
      setTimelineData([])
      setMilestones([])
      return
    }

    const selectedProject = projects.find((p) => p.id.toString() === selectedProjectId)
    if (!selectedProject) return

    // Filter tickets for selected project
    const projectTickets = tickets.filter((ticket) => ticket.projectId.toString() === selectedProjectId)

    // Calculate timeline position for each task based on creation date and due date
    const tasksWithTimeline = projectTickets.map((ticket, index) => {
      // Calculate start position (0-19 weeks)
      const createdDate = new Date(ticket.createdAt || Date.now())
      const baseStart = Math.floor(Math.random() * 8) // Random start between 0-7 weeks

      // Calculate duration based on priority and status
      let duration = 2 // Default 2 weeks
      if (ticket.priority === "high") duration = 1
      if (ticket.priority === "medium") duration = 2
      if (ticket.priority === "low") duration = 3

      // Adjust duration based on status
      if (ticket.status === "done") duration = Math.max(1, duration - 1)

      // Use actual completion percentage from ticket data
      const completed = ticket.completedPercentage || 0

      // Color based on status
      let color = "bg-gray-500"
      switch (ticket.status) {
        case "todo":
          color = "bg-gray-500"
          break
        case "in-progress":
          color = "bg-blue-500"
          break
        case "review":
          color = "bg-yellow-500"
          break
        case "done":
          color = "bg-green-500"
          break
      }

      return {
        id: ticket.id,
        name: ticket.title,
        start: baseStart + Math.floor(index / 3), // Spread tasks across timeline
        duration: duration,
        color: color,
        completed: completed,
        priority: ticket.priority,
        status: ticket.status,
        assignee: ticket.assigneeId,
        dueDate: ticket.dueDate,
      }
    })

    // Create project timeline data with individual tasks
    const projectTimeline = {
      id: selectedProject.id,
      name: selectedProject.name,
      tasks: tasksWithTimeline,
    }

    setTimelineData([projectTimeline])

    // Generate milestones based on project data
    const todoCount = projectTickets.filter((t) => t.status === "todo").length
    const inProgressCount = projectTickets.filter((t) => t.status === "in-progress").length
    const reviewCount = projectTickets.filter((t) => t.status === "review").length
    const doneCount = projectTickets.filter((t) => t.status === "done").length

    const projectMilestones = [
      {
        id: 1,
        title: `${selectedProject.name} - Planning Complete`,
        date: "June 15, 2025",
        status: todoCount === 0 ? "completed" : "upcoming",
        color: "blue",
      },
      {
        id: 2,
        title: `${selectedProject.name} - Development Milestone`,
        date: "July 30, 2025",
        status: inProgressCount > 0 ? "in-progress" : "planned",
        color: "purple",
      },
      {
        id: 3,
        title: `${selectedProject.name} - Review Phase`,
        date: "August 15, 2025",
        status: reviewCount > 0 ? "in-progress" : "planned",
        color: "amber",
      },
      {
        id: 4,
        title: `${selectedProject.name} - Launch`,
        date: "September 1, 2025",
        status: doneCount === projectTickets.length && projectTickets.length > 0 ? "completed" : "planned",
        color: "green",
      },
    ]

    setMilestones(projectMilestones)
  }, [selectedProjectId, tickets, projects])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "upcoming":
        return "bg-amber-500"
      default:
        return "bg-slate-500"
    }
  }

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setIsTaskModalOpen(true)
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-green-100 text-green-800" },
    }
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium
    return <Badge className={`${config.className} border-0 text-xs`}>{config.label}</Badge>
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
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <ListTodo size={18} />
            <span>Board</span>
          </Link>
          <Link
            href="/timeline"
            className="flex items-center gap-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-xl shadow-md transform transition-all duration-200 hover:scale-105"
          >
            <Clock size={18} />
            <span className="font-medium">Timeline</span>
          </Link>
          <Link
            href="/team"
            className="flex items-center gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            <Users size={18} />
            <span>Team</span>
          </Link>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="relative">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {user?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.username || "User"}</p>
              <p className="text-xs text-slate-500">Project Manager</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="md:hidden">
              <ListTodo size={18} />
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-8 h-9 w-[200px] md:w-[300px] rounded-md border border-slate-200 bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Today
            </Button>
            <Button variant="default" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
              <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Timeline content */}
        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Project Timeline</h1>
                <p className="text-slate-600">Track project progress and milestones</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <select className="h-9 rounded-md border border-slate-200 bg-white text-sm px-3">
                  <option>Week View</option>
                  <option>Month View</option>
                  <option>Quarter View</option>
                </select>
              </div>
            </div>
          </div>

          {/* Project Selector */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Select Project</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {timelineData.length > 0 ? (
            <Card className="overflow-auto">
              <CardHeader className="pb-0">
                <CardTitle>{timelineData[0]?.name} Timeline (May - September 2025)</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Timeline header */}
                <div className="mt-6 min-w-[1200px]">
                  <div className="flex border-b">
                    <div className="w-80 p-2 font-medium">Task</div>
                    <div className="flex-1 flex">
                      {weeks.map((week, index) => (
                        <div
                          key={index}
                          className={`w-14 p-2 text-xs text-center font-medium ${
                            index % 4 === 0 ? "border-l border-slate-200" : ""
                          }`}
                        >
                          {week}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timeline content - Individual Tasks */}
                  {timelineData.map((project) => (
                    <div key={project.id}>
                      {/* Project header */}
                      <div className="flex items-center bg-slate-50 border-b">
                        <div className="w-80 p-3 font-medium text-lg">{project.name}</div>
                        <div className="flex-1 h-10"></div>
                      </div>

                      {/* Individual task rows */}
                      {project.tasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="flex items-center hover:bg-slate-50 border-b border-slate-100 cursor-pointer transition-colors"
                          onClick={() => handleTaskClick(task.id)}
                        >
                          <div className="w-80 p-3 text-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">{task.name}</span>
                              {getPriorityBadge(task.priority)}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="capitalize">{task.status.replace("-", " ")}</span>
                              {task.dueDate && (
                                <>
                                  <span>•</span>
                                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 flex items-center h-16 relative">
                            {/* Task bar */}
                            <div
                              className={`absolute h-8 rounded-md ${task.color} opacity-80 hover:opacity-100 transition-opacity shadow-sm`}
                              style={{
                                left: `${task.start * 3.5}rem`,
                                width: `${task.duration * 3.5}rem`,
                              }}
                            >
                              {/* Progress bar */}
                              <div
                                className="h-full rounded-md bg-white bg-opacity-30"
                                style={{ width: `${task.completed}%` }}
                              ></div>
                              {/* Task label */}
                              <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium px-2">
                                {task.completed > 0 ? `${task.completed}%` : "Not Started"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data</h3>
                <p className="text-gray-500">
                  {selectedProjectId ? "No tasks found for this project" : "Select a project to view timeline"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Key Milestones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {milestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`bg-${milestone.color}-100 p-2 rounded-full`}>
                          <Calendar className={`h-5 w-5 text-${milestone.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-medium">{milestone.title}</h3>
                          <p className="text-sm text-slate-500">{milestone.date}</p>
                        </div>
                        <Badge className={`ml-auto ${getStatusColor(milestone.status)}`}>
                          {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal taskId={selectedTaskId} open={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
    </div>
  )
}
