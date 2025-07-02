"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useUsers } from "@/lib/hooks/useUsers"
import type { Task } from "@/lib/definitions"

interface TaskCardProps {
  task: Task
  onTaskClick: (taskId: string) => void
}

export function TaskCard({ task, onTaskClick }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { users } = useUsers()
  const assignee = users.find((user) => user.id === task.assigneeId)

  // Get left border color based on task category/type
  const getLeftBorderColor = () => {
    if (task.tags && task.tags.length > 0) {
      const primaryTag = task.tags[0]
      switch (primaryTag) {
        case "Design":
          return "border-l-blue-500"
        case "Development":
          return "border-l-purple-500"
        case "Content":
          return "border-l-green-500"
        default:
          return "border-l-gray-300"
      }
    }
    return "border-l-gray-300"
  }

  // Get priority badge color
  const getPriorityBadge = () => {
    switch (task.priority) {
      case "low":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs px-2 py-1">
            Low
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 text-xs px-2 py-1">
            Medium
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs px-2 py-1">
            High
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-500 text-xs px-2 py-1">
            Normal
          </Badge>
        )
    }
  }

  // Get tag badge color
  const getTagBadge = (tag: string) => {
    switch (tag) {
      case "Design":
        return (
          <Badge key={tag} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs px-2 py-1">
            {tag}
          </Badge>
        )
      case "Development":
        return (
          <Badge
            key={tag}
            variant="outline"
            className="text-purple-600 border-purple-200 bg-purple-50 text-xs px-2 py-1"
          >
            {tag}
          </Badge>
        )
      case "Content":
        return (
          <Badge key={tag} variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs px-2 py-1">
            {tag}
          </Badge>
        )
      default:
        return (
          <Badge key={tag} variant="outline" className="text-xs px-2 py-1">
            {tag}
          </Badge>
        )
    }
  }

  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening task detail when clicking on dropdown menu
    if ((e.target as HTMLElement).closest('[data-dropdown-menu="true"]')) {
      return
    }
    onTaskClick(task.id)
  }

  return (
    <Card
      className={`bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${getLeftBorderColor()} ${
        task.status === "done" ? "opacity-80" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">{task.tags.map((tag) => getTagBadge(tag))}</div>
        )}

        {/* Task Title and Menu */}
        <div className="flex justify-between items-start mb-2">
          <h4
            className={`font-medium text-gray-900 leading-tight ${
              task.status === "done" ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </h4>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
                data-dropdown-menu="true"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={task.status === "todo"}>Move to To Do</DropdownMenuItem>
              <DropdownMenuItem disabled={task.status === "in-progress"}>Move to In Progress</DropdownMenuItem>
              <DropdownMenuItem disabled={task.status === "review"}>Move to Review</DropdownMenuItem>
              <DropdownMenuItem disabled={task.status === "done"}>Move to Done</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Task Description */}
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>

        {/* Progress Bar */}
        {task.completedPercentage > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-medium text-gray-700">{task.completedPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${task.completedPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer with Priority and Assignee */}
        <div className="flex items-center justify-between">
          {getPriorityBadge()}
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
              <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
