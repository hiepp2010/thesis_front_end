"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell } from "lucide-react"
import type { User } from "@/lib/definitions"
import { userService } from "@/lib/api/user-service"

// Mock notifications data - will be replaced with API call later
const initialNotifications = [
  {
    id: "notif-1",
    userId: "user-2",
    action: "assigned",
    taskId: "task-5",
    taskTitle: "Update homepage hero section",
    read: false,
    timestamp: "2025-05-23T10:30:00Z",
  },
  {
    id: "notif-2",
    userId: "user-3",
    action: "commented",
    taskId: "task-6",
    taskTitle: "Create responsive navigation",
    read: false,
    timestamp: "2025-05-23T09:15:00Z",
  },
  {
    id: "notif-3",
    userId: "user-1",
    action: "moved",
    taskId: "task-8",
    taskTitle: "Review design system",
    status: "review",
    read: true,
    timestamp: "2025-05-22T16:45:00Z",
  },
  {
    id: "notif-4",
    userId: "user-5",
    action: "completed",
    taskId: "task-11",
    taskTitle: "Define brand voice guidelines",
    read: true,
    timestamp: "2025-05-18T11:00:00Z",
  },
]

export function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<Record<string, User>>({})
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = notifications.filter((notif) => !notif.read).length

  // Fetch user data when needed
  useEffect(() => {
    if (isOpen && Object.keys(users).length === 0) {
      fetchUserData()
    }
  }, [isOpen])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      // Get unique user IDs from notifications
      const userIds = [...new Set(notifications.map((notif) => notif.userId))]

      // Fetch each user's data
      const userMap: Record<string, User> = {}

      for (const userId of userIds) {
        try {
          const userData = await userService.getUserById(userId)
          if (userData) {
            userMap[userId] = userData
          }
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error)
        }
      }

      setUsers(userMap)
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserById = (userId: string | null) => {
    if (!userId) return undefined
    return users[userId]
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
    // TODO: Add API call to mark all notifications as read
  }

  const markAsRead = (notifId: string) => {
    setNotifications(notifications.map((notif) => (notif.id === notifId ? { ...notif, read: true } : notif)))
    // TODO: Add API call to mark notification as read
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }
  }

  const getNotificationText = (notification: (typeof notifications)[0]) => {
    const user = getUserById(notification.userId)
    const userName = user?.name || "Someone"

    switch (notification.action) {
      case "assigned":
        return `${userName} assigned you to "${notification.taskTitle}"`
      case "commented":
        return `${userName} commented on "${notification.taskTitle}"`
      case "moved":
        return `${userName} moved "${notification.taskTitle}" to ${notification.status}`
      case "completed":
        return `${userName} completed "${notification.taskTitle}"`
      default:
        return `${userName} updated "${notification.taskTitle}"`
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification) => {
              const user = getUserById(notification.userId)
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-2 p-3 ${notification.read ? "" : "bg-slate-50"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || ""} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{getNotificationText(notification)}</p>
                    <p className="text-xs text-slate-500">{formatTime(notification.timestamp)}</p>
                  </div>
                  {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500"></div>}
                </DropdownMenuItem>
              )
            })
          ) : (
            <div className="p-4 text-center text-sm text-slate-500">No notifications</div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center">View all notifications</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
