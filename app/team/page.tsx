"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Clock, Filter, ListTodo, Mail, MessageSquare, Plus, Search, Users } from "lucide-react"
import { useProjects } from "@/lib/hooks/useProjects"
import { useUsers } from "@/lib/hooks/useUsers"
import { useAuth } from "@/components/auth-provider"
import { useState, useEffect } from "react"
import { AddTeamMemberDialog } from "@/components/add-team-member-dialog"

export default function TeamPage() {
  const { user } = useAuth()
  const { projects, isLoading: projectsLoading } = useProjects()
  const { users, isLoading: usersLoading } = useUsers()
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)

  // API base URL - should point to your external API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fa1b-116-96-45-162.ngrok-free.app/api"

  // Set first project as default when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0])
    }
  }, [projects, selectedProject])

  // Fetch project members when selected project changes
  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!selectedProject) return

      try {
        setIsLoadingMembers(true)
        console.log("Fetching members for project:", selectedProject.id)

        // Get auth token
        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("jwt_token") || localStorage.getItem("token")

        // Use the external API endpoint (localhost:8080)
        const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/members`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const members = await response.json()
          console.log("Fetched members:", members)
          setProjectMembers(Array.isArray(members) ? members : [])
        } else {
          console.error("Failed to fetch project members:", response.status, response.statusText)
          setProjectMembers([])
        }
      } catch (error) {
        console.error("Error fetching project members:", error)
        setProjectMembers([])
      } finally {
        setIsLoadingMembers(false)
      }
    }

    fetchProjectMembers()
  }, [selectedProject, API_BASE_URL])

  const handleAddMember = async () => {
    // Refresh project members after adding
    if (selectedProject) {
      try {
        console.log("Refreshing members for project:", selectedProject.id)

        const token =
          localStorage.getItem("accessToken") || localStorage.getItem("jwt_token") || localStorage.getItem("token")

        const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/members`, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const members = await response.json()
          setProjectMembers(Array.isArray(members) ? members : [])
        }
      } catch (error) {
        console.error("Error refreshing project members:", error)
      }
    }
  }

  if (projectsLoading || usersLoading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading team data...</p>
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
            className="flex items-center gap-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-xl shadow-md transform transition-all duration-200 hover:scale-105"
          >
            <Users size={18} />
            <span className="font-medium">Team</span>
          </Link>
        </nav>

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
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="md:hidden">
              <ListTodo size={18} />
            </Button>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="search"
                placeholder="Search team members..."
                className="pl-8 h-9 w-[200px] md:w-[300px] rounded-md border border-slate-200 bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            {selectedProject && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setAddMemberOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            )}
          </div>
        </header>

        {/* Team content */}
        <main className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Team Members</h1>
                <p className="text-slate-600">Manage your team and their project assignments</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Project selector sidebar */}
            <div className="w-full md:w-64">
              <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200/50">
                <CardHeader>
                  <CardTitle className="text-lg">Projects</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 p-2">
                    {projects.map((project) => (
                      <Button
                        key={project.id}
                        variant={selectedProject?.id === project.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          selectedProject?.id === project.id
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : ""
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{project.name}</span>
                          <Badge
                            variant={selectedProject?.id === project.id ? "secondary" : "outline"}
                            className="ml-2"
                          >
                            {project.members?.length || 0}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team members list */}
            <div className="flex-1">
              {selectedProject ? (
                <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedProject.name}</CardTitle>
                        <p className="text-slate-600 mt-1">{selectedProject.description}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">
                        {projectMembers.length} Members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingMembers ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-slate-600">Loading members...</span>
                      </div>
                    ) : projectMembers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left p-4 font-medium text-slate-700">Member</th>
                              <th className="text-left p-4 font-medium text-slate-700">Email</th>
                              <th className="text-left p-4 font-medium text-slate-700">Role</th>
                              <th className="text-left p-4 font-medium text-slate-700">Status</th>
                              <th className="text-left p-4 font-medium text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {projectMembers.map((member) => (
                              <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="relative">
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.username} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                          {member.username?.charAt(0).toUpperCase() || "M"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900">{member.username}</p>
                                      <p className="text-sm text-slate-500">{member.fullName || "Team Member"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600">{member.email}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant="outline"
                                    className={
                                      selectedProject.owner?.id === member.id
                                        ? "border-purple-200 bg-purple-50 text-purple-700"
                                        : "border-blue-200 bg-blue-50 text-blue-700"
                                    }
                                  >
                                    {selectedProject.owner?.id === member.id ? "Owner" : "Member"}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                      <MessageSquare className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm">
                                      View Profile
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-slate-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No members found</p>
                        <p className="text-sm">Add members to this project to get started!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200/50">
                  <CardContent className="p-8 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-700 mb-2">Select a Project</h3>
                    <p className="text-slate-500">Choose a project from the sidebar to view its team members</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Team stats */}
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Team Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Projects</p>
                      <p className="text-3xl font-bold">{projects.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-full">
                      <ListTodo className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Team Size</p>
                      <p className="text-3xl font-bold">{selectedProject ? projectMembers.length : users.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md shadow-lg border-slate-200/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Active Members</p>
                      <p className="text-3xl font-bold">{selectedProject ? projectMembers.length : users.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-100 to-blue-100 p-3 rounded-full">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Add Member Dialog */}
      {selectedProject && (
        <AddTeamMemberDialog
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
          projectId={selectedProject.id}
          onMemberAdded={handleAddMember}
        />
      )}
    </div>
  )
}
