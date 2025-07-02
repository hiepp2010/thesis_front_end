"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { format } from "date-fns"
import {
  CalendarIcon,
  MessageSquare,
  Paperclip,
  GitBranch,
  Trash2,
  Upload,
  Download,
  Plus,
  RefreshCw,
} from "lucide-react"
import { useTickets } from "@/lib/hooks/useTickets"
import { useProjects } from "@/lib/hooks/useProjects"
import { useUsers } from "@/lib/hooks/useUsers"
import { useAuth } from "@/components/auth-provider"
import { ticketService } from "@/lib/api/ticket-service"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface TaskDetailModalProps {
  taskId: string
  open: boolean
  onClose: () => void
}

export function TaskDetailModal({ taskId, open, onClose }: TaskDetailModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { tickets, updateTicket, deleteTicket } = useTickets()
  const { projects } = useProjects()
  const { users } = useUsers()

  const [activeTab, setActiveTab] = useState("details")
  const [comments, setComments] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false)
  const [isLoadingRelationships, setIsLoadingRelationships] = useState(false)
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
    assigneeId: "",
    projectId: "",
    dueDate: null as Date | null,
    tag: "",
    completedPercentage: 0,
  })

  const task = tickets.find((t) => t.id === taskId)
  const project = projects.find((p) => p.id === task?.projectId)
  const assignee = users.find((u) => u.id === task?.assigneeId)

  // Check if user is project owner - improved logic
  const isProjectOwner = (() => {
    if (!project || !user) return false

    // Check various possible owner ID formats
    const userId = user.userId || user.id
    const projectOwnerId = project.ownerId || project.owner?.id

    // Convert both to strings for comparison
    const userIdStr = userId?.toString()
    const ownerIdStr = projectOwnerId?.toString()

    return userIdStr === ownerIdStr
  })()

  // Load project members when task loads
  useEffect(() => {
    if (task && project) {
      loadProjectMembers()
    }
  }, [task, project])

  const loadProjectMembers = async () => {
    if (!project) return
    setIsLoadingMembers(true)
    try {
      console.log("Fetching members for project:", project.id)

      // Get auth token - same pattern as team page
      const token =
        localStorage.getItem("accessToken") || localStorage.getItem("jwt_token") || localStorage.getItem("token")

      // Use the external API endpoint (localhost:8080) - same as team page
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fa1b-116-96-45-162.ngrok-free.app/api"
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}/members`, {
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

  // Initialize form data when task loads
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        assigneeId: task.assigneeId || "unassigned",
        projectId: task.projectId.toString(),
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        tag: task.tags?.[0] || "General",
        completedPercentage: task.completedPercentage || 0,
      })
    }
  }, [task])

  // Load comments when tab changes to comments
  useEffect(() => {
    if (activeTab === "comments" && task) {
      loadComments()
    }
  }, [activeTab, task])

  // Load attachments when tab changes to attachments
  useEffect(() => {
    if (activeTab === "attachments" && task) {
      loadAttachments()
    }
  }, [activeTab, task])

  // Load relationships when tab changes to linked items
  useEffect(() => {
    if (activeTab === "linked" && task) {
      loadRelationships()
    }
  }, [activeTab, task])

  const loadComments = async () => {
    if (!task) return
    setIsLoadingComments(true)
    try {
      const commentsData = await ticketService.getTicketComments(task.id)
      setComments(commentsData || [])
    } catch (error) {
      console.error("Failed to load comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const loadAttachments = async () => {
    if (!task) return
    setIsLoadingAttachments(true)
    try {
      const attachmentsData = await ticketService.getTicketAttachments(task.id)
      setAttachments(attachmentsData || [])
    } catch (error) {
      console.error("Failed to load attachments:", error)
    } finally {
      setIsLoadingAttachments(false)
    }
  }

  const loadRelationships = async () => {
    if (!task) return
    setIsLoadingRelationships(true)
    try {
      const relationshipsData = await ticketService.getTaskRelationships(task.id)
      setRelationships(relationshipsData || [])
    } catch (error) {
      console.error("Failed to load relationships:", error)
    } finally {
      setIsLoadingRelationships(false)
    }
  }

  const handleSave = async () => {
    if (!task || !isProjectOwner) return

    setIsSaving(true)
    try {
      await updateTicket(task.id, {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assigneeId: formData.assigneeId === "unassigned" ? null : formData.assigneeId,
        dueDate: formData.dueDate?.toISOString() || null,
        completedPercentage: formData.completedPercentage,
      })

      // Show success toast
      toast({
        title: "Task Updated",
        description: "Task has been successfully updated.",
      })

      // Close modal first
      onClose()

      // Auto-refresh the page after a short delay
      setTimeout(() => {
        router.refresh()
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error("Failed to update task:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !isProjectOwner) return

    if (confirm("Are you sure you want to delete this task?")) {
      setIsDeleting(true)
      try {
        await deleteTicket(task.id)

        // Show success toast
        toast({
          title: "Task Deleted",
          description: "Task has been successfully deleted.",
        })

        // Close modal first
        onClose()

        // Auto-refresh the page after a short delay
        setTimeout(() => {
          router.refresh()
          window.location.reload()
        }, 500)
      } catch (error) {
        console.error("Failed to delete task:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task) return

    try {
      await ticketService.createTicketComment(task.id, newComment)
      setNewComment("")
      loadComments() // Reload comments

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast({
        title: "Comment Failed",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !task || !isProjectOwner) return

    try {
      await ticketService.uploadFileToTicket(task.id, file)
      loadAttachments() // Reload attachments

      toast({
        title: "File Uploaded",
        description: `${file.name} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Failed to upload file:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadFile = async (fileName: string) => {
    if (!task) return

    try {
      const downloadData = await ticketService.getFileDownloadUrl(task.id, fileName)
      window.open(downloadData.downloadUrl, "_blank")
    } catch (error) {
      console.error("Failed to download file:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task || !isProjectOwner) return

    if (confirm("Are you sure you want to delete this attachment?")) {
      try {
        await ticketService.deleteTicketAttachment(task.id, attachmentId)
        loadAttachments() // Reload attachments

        toast({
          title: "Attachment Deleted",
          description: "Attachment has been deleted successfully.",
        })
      } catch (error) {
        console.error("Failed to delete attachment:", error)
        toast({
          title: "Delete Failed",
          description: "Failed to delete attachment. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      todo: { label: "To Do", className: "bg-gray-100 text-gray-800" },
      "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800" },
      review: { label: "Review", className: "bg-yellow-100 text-yellow-800" },
      done: { label: "Done", className: "bg-green-100 text-green-800" },
      reopened: { label: "Reopened", className: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.todo
    return <Badge className={`${config.className} border-0`}>{config.label}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            {getStatusBadge(task.status)}
            <DialogTitle className="text-xl font-semibold">{task.title}</DialogTitle>
            {(isSaving || isDeleting) && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                {isSaving ? "Saving..." : "Deleting..."}
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            <TabsTrigger value="attachments">Attachments ({attachments.length})</TabsTrigger>
            <TabsTrigger value="linked">Linked Items ({relationships.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a description..."
                className="mt-2 min-h-[120px] resize-none"
                disabled={!isProjectOwner || isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="project" className="text-sm font-medium text-gray-700">
                  Project
                </Label>
                <Select value={formData.projectId} disabled>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={project?.id || "default"}>{project?.name}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-medium text-gray-700">
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  disabled={!isProjectOwner || isSaving}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignee" className="text-sm font-medium text-gray-700">
                  Assignee
                </Label>
                <Select
                  value={formData.assigneeId || "unassigned"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assigneeId: value === "unassigned" ? "" : value })
                  }
                  disabled={!isProjectOwner || isLoadingMembers || isSaving}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={isLoadingMembers ? "Loading members..." : "Unassigned"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        <span>{member.username}</span>
                        {project?.owner?.id === member.id && (
                          <Badge variant="outline" className="text-xs ml-2">
                            Owner
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={!isProjectOwner || isSaving}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tag" className="text-sm font-medium text-gray-700">
                  Tag
                </Label>
                <Select
                  value={formData.tag}
                  onValueChange={(value) => setFormData({ ...formData, tag: value })}
                  disabled={!isProjectOwner || isSaving}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Content">Content</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full mt-2 justify-start text-left font-normal bg-transparent"
                      disabled={!isProjectOwner || isSaving}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "MM/dd/yyyy") : "mm/dd/yyyy"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <Label htmlFor="progress" className="text-sm font-medium text-gray-700">
                Progress ({formData.completedPercentage}%)
              </Label>
              <div className="space-y-2">
                <Slider
                  id="progress"
                  min={0}
                  max={100}
                  step={5}
                  value={[formData.completedPercentage]}
                  onValueChange={(value) => setFormData({ ...formData, completedPercentage: value[0] })}
                  disabled={!isProjectOwner || isSaving}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="flex-1 p-6 space-y-4 overflow-y-auto">
            {isLoadingComments ? (
              <div className="text-center py-8">Loading comments...</div>
            ) : (
              <>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{comment.author?.username?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.author?.username || "Unknown"}</span>
                          <span className="text-xs text-gray-500">
                            {comment.createdAt ? format(new Date(comment.createdAt), "MMM dd, h:mm a") : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-3 pt-4 border-t">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.username?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="flex-1 p-6">
            {isLoadingAttachments ? (
              <div className="text-center py-8">Loading attachments...</div>
            ) : (
              <>
                {attachments.length > 0 ? (
                  <div className="space-y-3">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{attachment.fileName}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadFile(attachment.fileName)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          {isProjectOwner && (
                            <Button variant="outline" size="sm" onClick={() => handleDeleteAttachment(attachment.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No attachments yet</p>
                  </div>
                )}

                {isProjectOwner && (
                  <div className="mt-6">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.zip,.png,.jpg,.jpeg,.gif"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById("file-upload")?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Linked Items Tab */}
          <TabsContent value="linked" className="flex-1 p-6">
            {isLoadingRelationships ? (
              <div className="text-center py-8">Loading relationships...</div>
            ) : (
              <>
                {relationships.length > 0 ? (
                  <div className="space-y-3">
                    {relationships.map((relationship) => (
                      <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <GitBranch className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{relationship.readableDescription}</p>
                            <p className="text-sm text-gray-500">{relationship.relationshipType}</p>
                          </div>
                        </div>
                        {isProjectOwner && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => ticketService.deleteTaskRelationship(relationship.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No linked items yet</p>
                  </div>
                )}

                {isProjectOwner && (
                  <Button variant="outline" className="mt-4 w-full bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Link Item
                  </Button>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div>
            {isProjectOwner && (
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || isSaving}>
                {isDeleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </>
                )}
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>
              Cancel
            </Button>
            {isProjectOwner && (
              <Button onClick={handleSave} disabled={isSaving || isDeleting}>
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Access Control Notice for Members */}
        {!isProjectOwner && (
          <div className="absolute top-16 left-6 right-6 bg-blue-50 border border-blue-200 rounded-lg p-3 z-10">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You can view task details and add comments. Only project owners can edit task
              details.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
