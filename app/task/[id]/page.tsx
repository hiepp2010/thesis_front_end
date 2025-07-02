import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Link2,
  ListTodo,
  MessageSquare,
  Paperclip,
  Search,
  Settings,
  Users,
} from "lucide-react"

export default function TaskDetailPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col bg-white border-r border-slate-200 p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-blue-600 text-white p-1 rounded">
            <ListTodo size={24} />
          </div>
          <h1 className="text-xl font-bold">TaskFlow</h1>
        </div>

        <nav className="space-y-1">
          <Link
            href="/overview"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </Link>
          <Link href="/board" className="flex items-center gap-2 text-slate-900 bg-slate-100 px-3 py-2 rounded-md">
            <ListTodo size={18} />
            <span>Board</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
          >
            <Clock size={18} />
            <span>Timeline</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
          >
            <Users size={18} />
            <span>Team</span>
          </Link>
          <Link
            href="#"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 rounded-md"
          >
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto">
          <div className="flex items-center gap-2 p-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-slate-500">Product Manager</p>
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
                placeholder="Search tasks..."
                className="pl-8 h-9 w-[200px] md:w-[300px] rounded-md border border-slate-200 bg-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Task Detail content */}
        <main className="p-6">
          <div className="mb-6">
            <Link href="/board" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Board
            </Link>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Main task details */}
              <div className="flex-1">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500">In Progress</Badge>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Link2 className="mr-2 h-4 w-4" />
                          Copy Link
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold mt-3">Update homepage hero section</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Description</h3>
                        <p className="text-slate-700">
                          Redesign the hero section with new branding elements. The hero section should include the new
                          logo, updated tagline, and a call-to-action button that aligns with our new marketing
                          strategy. The design should be responsive and work well on all device sizes.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Project</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-slate-700">
                              Website Redesign
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Priority</h3>
                          <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                            Medium
                          </Badge>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Assignee</h3>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/diverse-person-portrait.png" alt="User" />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">Alex Johnson</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Due Date</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span>May 25, 2025</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Labels</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                              Design
                            </Badge>
                            <Badge variant="outline" className="text-purple-500 border-purple-200 bg-purple-50">
                              Frontend
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-slate-500 mb-2">Reporter</h3>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">John Doe</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Attachments</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                            <Paperclip className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">brand_guidelines.pdf</span>
                            <Button variant="ghost" size="sm" className="ml-auto h-7 px-2">
                              View
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 p-2 border rounded-md bg-slate-50">
                            <Paperclip className="h-4 w-4 text-slate-500" />
                            <span className="text-sm">hero_mockup_v1.png</span>
                            <Button variant="ghost" size="sm" className="ml-auto h-7 px-2">
                              View
                            </Button>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            <Paperclip className="mr-2 h-4 w-4" />
                            Add Attachment
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Activity</h3>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">John Doe</span>
                                  <span className="text-xs text-slate-500">Yesterday at 2:30 PM</span>
                                </div>
                                <p className="text-sm text-slate-700">
                                  I've attached the brand guidelines and an initial mockup. Please review and provide
                                  feedback.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/diverse-person-portrait.png" alt="User" />
                              <AvatarFallback>A</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">Alex Johnson</span>
                                  <span className="text-xs text-slate-500">Today at 9:15 AM</span>
                                </div>
                                <p className="text-sm text-slate-700">
                                  Thanks for the guidelines. I'll start working on the redesign today and should have an
                                  updated mockup by tomorrow.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Textarea placeholder="Add a comment..." className="min-h-[100px]" />
                              <div className="flex justify-end mt-2">
                                <Button>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Comment
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-64">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <Button variant="outline" className="justify-start">
                          <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
                          To Do
                        </Button>
                        <Button variant="default" className="justify-start bg-blue-500 hover:bg-blue-600">
                          <span className="w-2 h-2 rounded-full bg-white mr-2"></span>
                          In Progress
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
                          Review
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                          Done
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-2">
                        <Button variant="outline" className="justify-start">
                          <Users className="mr-2 h-4 w-4" />
                          Assign
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Clock className="mr-2 h-4 w-4" />
                          Set Due Date
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Paperclip className="mr-2 h-4 w-4" />
                          Add Attachment
                        </Button>
                        <Button
                          variant="outline"
                          className="justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark Complete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Linked Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="p-2 border rounded-md text-sm hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">Create design system</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Related task</p>
                        </div>
                        <div className="p-2 border rounded-md text-sm hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">Update brand assets</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Blocked by</p>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Link2 className="mr-2 h-4 w-4" />
                          Link Item
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
