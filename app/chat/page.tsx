"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Hash,
  Plus,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Users,
  Search,
  MessageSquare,
  WifiOff,
  RefreshCw,
  Settings,
  LogOut,
  Clock,
  CheckCheck,
  Upload,
  UserPlus,
  X,
  FileText,
  ImageIcon,
  Music,
  Film,
  Download,
} from "lucide-react"
import { useRouter } from "next/navigation"

// Configuration
const API_GATEWAY_URL = " https://fa1b-116-96-45-162.ngrok-free.app"
const CHAT_SERVICE_URL = "https://c01e-116-96-45-162.ngrok-free.app"

interface User {
  id: number
  userId?: number
  username: string
  email: string
  fullName?: string
  avatar?: string
  status?: "online" | "away" | "busy" | "offline"
  title?: string
  token?: string
  accessToken?: string
}

interface Message {
  id: string | number
  content: string
  senderUsername: string
  senderId?: number
  recipientId?: number
  chatRoomId?: number
  messageType: string
  createdAt: string | number[]
  attachmentUrl?: string
  attachmentName?: string
  attachmentSize?: number
}

interface Room {
  id: number
  name: string
  memberIds?: string[]
  ownerId?: string
  members?: User[]
}

interface RoomMember {
  id: number
  chatRoomId: number
  userId: number
  username: string
  fullName: string
  role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER"
  joinedAt: string
  lastReadAt?: string
  isMuted: boolean
  isActive: boolean
}

export default function ChatPage() {
  const router = useRouter()
  // State management
  const [user, setUser] = useState<User | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null)
  const [newRoomName, setNewRoomName] = useState("")
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)

  // 1-1 Chat state
  const [chatMode, setChatMode] = useState<"rooms" | "direct">("rooms")
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [directMessages, setDirectMessages] = useState<Message[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Message[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [showCreateRoom, setShowCreateRoom] = useState(false)

  // File upload state
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileMessage, setFileMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Member management state
  const [showMemberManagement, setShowMemberManagement] = useState(false)
  const [roomMembers, setRoomMembers] = useState<RoomMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [newMemberIds, setNewMemberIds] = useState<string>("")

  // Refs
  const stompClient = useRef<Client | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscriptionsRef = useRef<any>({})
  const currentRoomIdRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_GATEWAY_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })
      if (!response.ok) throw new Error("Login failed")
      const userData = await response.json()
      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)
      setTimeout(() => {
        connectWebSocket()
      }, 1000)
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  // Logout function
  const handleLogout = () => {
    disconnectWebSocket()
    setUser(null)
    setMessages([])
    setRooms([])
    setCurrentRoomId(null)
    setCurrentRoom(null)
    localStorage.removeItem("user")
  }

  // WebSocket connection
  const connectWebSocket = () => {
    if (!user) return

    const token = user.token || user.accessToken
    if (!token) return

    try {
      stompClient.current = new Client({
        webSocketFactory: () => new SockJS(`${CHAT_SERVICE_URL}/ws`),
        connectHeaders: {
          username: user.username,
        },
        debug: (str) => console.log("STOMP:", str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      stompClient.current.onConnect = (frame) => {
        console.log("Connected to WebSocket:", frame)
        setIsConnected(true)
        if (currentRoomId) {
          currentRoomIdRef.current = currentRoomId
          subscribeToRoom(currentRoomId)
        }
      }

      stompClient.current.onStompError = (frame) => {
        console.error("WebSocket error:", frame)
        setIsConnected(false)
      }

      stompClient.current.activate()
    } catch (error) {
      console.error("WebSocket connection error:", error)
      setIsConnected(false)
    }
  }

  // Subscribe to room-specific topics
  const subscribeToRoom = (roomId: number) => {
    if (!stompClient.current || !isConnected) return

    const messageSubscription = stompClient.current.subscribe(`/topic/chat/${roomId}`, (message) => {
      const receivedMessage = JSON.parse(message.body)
      setMessages((prev) => {
        const messageExists = prev.some((m) => m.id === receivedMessage.id)
        if (messageExists) return prev
        return [...prev, receivedMessage]
      })
    })

    const typingSubscription = stompClient.current.subscribe(`/topic/typing/${roomId}`, (typingStatus) => {
      const status = JSON.parse(typingStatus.body)
      if (currentRoomIdRef.current === roomId) {
        if (status.typing) {
          setTypingUsers((prev) => [...prev.filter((u) => u !== status.userId), status.userId])
        } else {
          setTypingUsers((prev) => prev.filter((u) => u !== status.userId))
        }
      }
    })

    subscriptionsRef.current[roomId] = { messageSubscription, typingSubscription }
  }

  // Subscribe to direct chat topics
  const subscribeToDirectChat = (recipientId: number) => {
    if (!stompClient.current || !isConnected) return

    const directMessageSubscription = stompClient.current.subscribe("/topic/direct-chat", (message) => {
      const receivedMessage = JSON.parse(message.body)
      if (
        (receivedMessage.senderId === user?.userId && receivedMessage.recipientId === recipientId) ||
        (receivedMessage.senderId === recipientId && receivedMessage.recipientId === user?.userId)
      ) {
        setDirectMessages((prev) => {
          const messageExists = prev.some(
            (m) =>
              m.id === receivedMessage.id ||
              (m.id &&
                m.id.toString().startsWith("temp_") &&
                m.content === receivedMessage.content &&
                m.senderId === receivedMessage.senderId),
          )
          if (messageExists) {
            return prev.map((m) =>
              m.id &&
              m.id.toString().startsWith("temp_") &&
              m.content === receivedMessage.content &&
              m.senderId === receivedMessage.senderId
                ? receivedMessage
                : m,
            )
          }
          return [...prev, receivedMessage]
        })
      }
    })

    const userMessageSubscription = stompClient.current.subscribe(`/topic/user/${user?.userId}`, (message) => {
      const receivedMessage = JSON.parse(message.body)
      if (
        (receivedMessage.senderId === user?.userId && receivedMessage.recipientId === recipientId) ||
        (receivedMessage.senderId === recipientId && receivedMessage.recipientId === user?.userId)
      ) {
        setDirectMessages((prev) => {
          const messageExists = prev.some(
            (m) =>
              m.id === receivedMessage.id ||
              (m.id &&
                m.id.toString().startsWith("temp_") &&
                m.content === receivedMessage.content &&
                m.senderId === receivedMessage.senderId),
          )
          if (messageExists) {
            return prev.map((m) =>
              m.id &&
              m.id.toString().startsWith("temp_") &&
              m.content === receivedMessage.content &&
              m.senderId === receivedMessage.senderId
                ? receivedMessage
                : m,
            )
          }
          return [...prev, receivedMessage]
        })
      }
    })

    subscriptionsRef.current[`direct_${recipientId}`] = {
      messageSubscription: directMessageSubscription,
      typingSubscription: userMessageSubscription,
    }
  }

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    Object.values(subscriptionsRef.current).forEach((subscription: any) => {
      if (subscription) {
        subscription.messageSubscription.unsubscribe()
        subscription.typingSubscription.unsubscribe()
      }
    })
    subscriptionsRef.current = {}
    if (stompClient.current) {
      stompClient.current.deactivate()
      stompClient.current = null
    }
    setIsConnected(false)
  }

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() || !stompClient.current || !isConnected || !currentRoomId) return

    const message = {
      content: newMessage.trim(),
      senderUsername: user?.username,
      chatRoomId: Number.parseInt(currentRoomId.toString()),
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
    }

    stompClient.current.publish({
      destination: "/app/send-message",
      body: JSON.stringify(message),
    })

    setNewMessage("")
    sendTypingStatus(false)
  }

  // Send direct message
  const sendDirectMessage = () => {
    if (!newMessage.trim() || !stompClient.current || !isConnected || !selectedUser) return

    const message = {
      senderId: user?.userId,
      recipientId: selectedUser.id,
      content: newMessage.trim(),
      messageType: "TEXT",
    }

    const optimisticMessage = {
      ...message,
      id: `temp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      senderUsername: user?.username || "",
    }

    setDirectMessages((prev) => [...prev, optimisticMessage])

    stompClient.current.publish({
      destination: "/app/send-direct-message",
      body: JSON.stringify(message),
    })

    setNewMessage("")
  }

  // Send typing status
  const sendTypingStatus = (isTyping: boolean) => {
    if (!stompClient.current || !isConnected || !currentRoomId) return

    const typingStatus = {
      chatRoomId: currentRoomId,
      userId: user?.username,
      typing: isTyping,
    }

    stompClient.current.publish({
      destination: "/app/typing",
      body: JSON.stringify(typingStatus),
    })
  }

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      sendTypingStatus(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      sendTypingStatus(false)
    }, 1000)
  }

  // File upload functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setShowFileUpload(true)
    }
  }

  const uploadFile = async () => {
    if (!selectedFile || !user || (!currentRoomId && !selectedUser)) return

    try {
      setIsUploading(true)
      const token = user.token || user.accessToken
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("senderId", user.userId?.toString() || "")
      if (fileMessage.trim()) {
        formData.append("message", fileMessage.trim())
      }

      let endpoint = ""
      if (chatMode === "rooms" && currentRoomId) {
        endpoint = `${API_GATEWAY_URL}/api/chat/rooms/${currentRoomId}/upload`
      } else if (chatMode === "direct" && selectedUser) {
        formData.append("recipientId", selectedUser.id.toString())
        endpoint = `${API_GATEWAY_URL}/api/chat/direct-upload`
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const uploadedMessage = await response.json()
        if (chatMode === "rooms") {
          setMessages((prev) => [...prev, uploadedMessage])
        } else {
          setDirectMessages((prev) => [...prev, uploadedMessage])
        }
        setShowFileUpload(false)
        setSelectedFile(null)
        setFileMessage("")
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("File upload failed:", error)
      alert("File upload failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsUploading(false)
    }
  }

  // Member management functions
  const loadRoomMembers = async (roomId: number) => {
    if (!user) return

    try {
      setLoadingMembers(true)
      const token = user.token || user.accessToken
      const response = await fetch(`${API_GATEWAY_URL}/api/chat/rooms/${roomId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const membersData = await response.json()
        setRoomMembers(membersData)
      }
    } catch (error) {
      console.error("Failed to load members:", error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const addMembersToRoom = async () => {
    if (!newMemberIds.trim() || !currentRoomId || !user) return

    try {
      const token = user.token || user.accessToken
      const response = await fetch(
        `${API_GATEWAY_URL}/api/chat/rooms/${currentRoomId}/members?memberIds=${newMemberIds}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.ok) {
        setNewMemberIds("")
        loadRoomMembers(currentRoomId)
        alert("Members added successfully!")
      } else {
        throw new Error("Failed to add members")
      }
    } catch (error) {
      console.error("Failed to add members:", error)
      alert("Failed to add members: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const removeMemberFromRoom = async (userId: number) => {
    if (!currentRoomId || !user) return

    try {
      const token = user.token || user.accessToken
      const response = await fetch(`${API_GATEWAY_URL}/api/chat/rooms/${currentRoomId}/members/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        loadRoomMembers(currentRoomId)
        alert("Member removed successfully!")
      } else {
        throw new Error("Failed to remove member")
      }
    } catch (error) {
      console.error("Failed to remove member:", error)
      alert("Failed to remove member: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  // Create room
  const createRoom = async () => {
    if (!newRoomName.trim() || !user) return

    try {
      const token = user.token || user.accessToken
      if (!token) return

      const response = await fetch(`${API_GATEWAY_URL}/api/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newRoomName,
          memberIds: [user.userId?.toString()],
          ownerId: user.userId?.toString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to create room")

      const roomData = await response.json()
      setNewRoomName("")
      setShowCreateRoom(false)
      await loadRooms()

      if (roomData.id) {
        setCurrentRoomId(roomData.id)
        currentRoomIdRef.current = roomData.id
        setCurrentRoom(roomData)
        loadMessages(roomData.id)
      }
    } catch (error) {
      console.error("Failed to create room:", error)
      alert("Failed to create room: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  // Load rooms
  const loadRooms = async () => {
    if (!user) return

    try {
      setLoadingRooms(true)
      const token = user.token || user.accessToken
      const response = await fetch(`${API_GATEWAY_URL}/api/chat/rooms/user/${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to load rooms")

      const roomsData = await response.json()
      setRooms(roomsData)

      if (!currentRoomId && roomsData.length > 0) {
        const firstRoom = roomsData[0]
        setCurrentRoomId(firstRoom.id)
        currentRoomIdRef.current = firstRoom.id
        setCurrentRoom(firstRoom)
        loadMessages(firstRoom.id)

        if (isConnected && stompClient.current) {
          subscribeToRoom(firstRoom.id)
        }
      }
    } catch (error) {
      console.error("Failed to load rooms:", error)
    } finally {
      setLoadingRooms(false)
    }
  }

  // Load messages for a room
  const loadMessages = async (roomId: number) => {
    if (!user || !roomId) return

    try {
      setLoadingMessages(true)
      const token = user.token || user.accessToken
      const response = await fetch(`${API_GATEWAY_URL}/api/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Load direct chat history
  const loadDirectChatHistory = async (userId1: number, userId2: number) => {
    if (!user) return

    try {
      setLoadingMessages(true)
      const token = user.token || user.accessToken
      const response = await fetch(`${API_GATEWAY_URL}/api/chat/direct-messages/${userId1}/${userId2}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const directMessagesData = await response.json()
        setDirectMessages(directMessagesData || [])
      } else if (response.status === 404) {
        setDirectMessages([])
      }
    } catch (error) {
      console.error("Failed to load direct messages:", error)
      setDirectMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  // Load users for direct chat
  const loadUsers = async () => {
    if (!user) return

    try {
      const mockUsers = [
        { id: 87, username: "bob", email: "bob@example.com", fullName: "Bob", status: "online" as const },
        { id: 86, username: "alice", email: "alice@example.com", fullName: "Alice", status: "away" as const },
        {
          id: 84,
          username: "testuser1",
          email: "testuser1@example.com",
          fullName: "Test User1",
          status: "busy" as const,
        },
        { id: 83, username: "user2", email: "user2@test.com", fullName: "Jane Smith", status: "online" as const },
        { id: 82, username: "user1", email: "user1@test.com", fullName: "John Doe", status: "offline" as const },
      ].filter((u) => u.id !== user.userId)

      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } catch (error) {
      console.error("Failed to load users:", error)
    }
  }

  // Search messages
  const searchMessages = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsSearching(true)
      const token = user?.token || user?.accessToken
      const response = await fetch(`${API_GATEWAY_URL}/api/chat/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          page: 0,
          size: 20,
          sortBy: "createdAt",
          sortDirection: "desc",
        }),
      })

      if (response.ok) {
        const searchData = await response.json()
        setSearchResults(searchData.content || [])
      }
    } catch (error) {
      console.error("Failed to search messages:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Filter users based on search query
  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query)
    if (!query.trim()) {
      setFilteredUsers(users)
    } else {
      const filtered = users.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          (u.fullName && u.fullName.toLowerCase().includes(query.toLowerCase())) ||
          u.email.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredUsers(filtered)
    }
  }

  // Switch room
  const switchRoom = (roomId: number) => {
    const selectedRoom = rooms.find((room) => room.id === roomId)
    setCurrentRoomId(roomId)
    currentRoomIdRef.current = roomId
    setCurrentRoom(selectedRoom || null)
    setMessages([])
    setTypingUsers([])

    if (isConnected && stompClient.current && currentRoomId && subscriptionsRef.current[currentRoomId]) {
      const { messageSubscription, typingSubscription } = subscriptionsRef.current[currentRoomId]
      messageSubscription.unsubscribe()
      typingSubscription.unsubscribe()
      subscriptionsRef.current[currentRoomId] = null
    }

    if (isConnected && stompClient.current) {
      subscribeToRoom(roomId)
    }

    loadMessages(roomId)
  }

  // Switch to direct chat
  const switchToDirectChat = (targetUser: User) => {
    setSelectedUser(targetUser)
    setDirectMessages([])
    setChatMode("direct")
    setCurrentRoomId(null)
    setCurrentRoom(null)
    setMessages([])
    setTypingUsers([])

    if (isConnected && stompClient.current && currentRoomId && subscriptionsRef.current[currentRoomId]) {
      const { messageSubscription, typingSubscription } = subscriptionsRef.current[currentRoomId]
      messageSubscription.unsubscribe()
      typingSubscription.unsubscribe()
      subscriptionsRef.current[currentRoomId] = null
    }

    if (isConnected && stompClient.current) {
      subscribeToDirectChat(targetUser.id)
    }

    if (user?.userId) {
      loadDirectChatHistory(user.userId, targetUser.id)
    }
  }

  // Format time helper
  const formatTime = (timestamp: string | number[]) => {
    try {
      if (Array.isArray(timestamp)) {
        const [year, month, day, hour, minute, second] = timestamp
        return new Date(year, month - 1, day, hour, minute, second).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      } else {
        return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    } catch (error) {
      return "Invalid time"
    }
  }

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  // Get file icon based on message type
  const getFileIcon = (messageType: string) => {
    switch (messageType.toLowerCase()) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Film className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Effects
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setTimeout(() => {
        connectWebSocket()
      }, 500)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadRooms()
      loadUsers()
    }
  }, [user])

  useEffect(() => {
    if (user && !isConnected) {
      setTimeout(() => {
        connectWebSocket()
      }, 1000)
    }
  }, [user, isConnected])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(subscriptionsRef.current).forEach((subscription: any) => {
        if (subscription) {
          subscription.messageSubscription.unsubscribe()
          subscription.typingSubscription.unsubscribe()
        }
      })
    }
  }, [])

  useEffect(() => {
    if (isConnected && stompClient.current && currentRoomId && chatMode === "rooms") {
      if (!subscriptionsRef.current[currentRoomId]) {
        subscribeToRoom(currentRoomId)
      }
    }
  }, [isConnected, currentRoomId, chatMode])

  useEffect(() => {
    if (isConnected && stompClient.current && selectedUser && chatMode === "direct") {
      if (!subscriptionsRef.current[`direct_${selectedUser.id}`]) {
        subscribeToDirectChat(selectedUser.id)
      }
    }
  }, [isConnected, selectedUser, chatMode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, directMessages])

  // Login form
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                TaskFlow Chat
              </h1>
              <p className="text-gray-600 mt-2">Connect with your team instantly</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="h-12 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Sign In to Chat
              </Button>

              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-sm text-gray-600 mb-2">Demo Account:</p>
                  <div className="font-mono text-sm bg-white px-3 py-2 rounded border">
                    <div className="text-blue-600">chattestuser2</div>
                    <div className="text-gray-500">password123</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="*/*" />

      {/* File Upload Dialog */}
      <Dialog open={showFileUpload} onOpenChange={setShowFileUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a file to{" "}
              {chatMode === "rooms" ? `#${currentRoom?.name}` : selectedUser?.fullName || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getFileIcon(
                  selectedFile.type.startsWith("image/")
                    ? "image"
                    : selectedFile.type.startsWith("video/")
                      ? "video"
                      : selectedFile.type.startsWith("audio/")
                        ? "audio"
                        : "file",
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setShowFileUpload(false)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Input
              placeholder="Add a message (optional)"
              value={fileMessage}
              onChange={(e) => setFileMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFileUpload(false)}>
              Cancel
            </Button>
            <Button onClick={uploadFile} disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Member Management Dialog */}
      <Dialog open={showMemberManagement} onOpenChange={setShowMemberManagement}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Members - #{currentRoom?.name}</DialogTitle>
            <DialogDescription>Add or remove members from this channel</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Add Members */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Add Members</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter user IDs (comma-separated)"
                  value={newMemberIds}
                  onChange={(e) => setNewMemberIds(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addMembersToRoom} disabled={!newMemberIds.trim()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            {/* Current Members */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Current Members</h4>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {roomMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                            {member.fullName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.fullName}</p>
                          <p className="text-xs text-gray-500">@{member.username}</p>
                        </div>
                        <Badge variant={member.role === "OWNER" ? "default" : "secondary"} className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      {member.role !== "OWNER" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMemberFromRoom(member.userId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMemberManagement(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">TaskFlow Chat</h1>
                <p className="text-sm text-gray-500">Welcome back, {user.fullName || user.username}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Connection Status */}
          <div
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${isConnected ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {isConnected ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Connected</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium">Disconnected</span>
                <Button variant="ghost" size="sm" onClick={connectWebSocket} className="ml-auto h-6 w-6 p-0">
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Chat Mode Tabs */}
        <Tabs
          value={chatMode}
          onValueChange={(value) => setChatMode(value as "rooms" | "direct")}
          className="flex-1 flex flex-col"
        >
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger
                value="rooms"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Hash className="h-4 w-4" />
                Rooms
              </TabsTrigger>
              <TabsTrigger
                value="direct"
                className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Direct
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="rooms" className="flex-1 flex flex-col m-0 mt-4">
            {/* Search */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchMessages()}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>

              {/* Add Advanced Search Link */}
              <div className="mt-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/chat/search")}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Advanced Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg max-h-32 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-blue-700">Search Results:</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/chat/search?q=${encodeURIComponent(searchQuery)}`)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      View All
                    </Button>
                  </div>
                  {searchResults.map((result, index) => (
                    <div key={index} className="text-xs p-2 hover:bg-blue-100 rounded cursor-pointer">
                      <span className="font-medium text-blue-800">{result.senderUsername}:</span>
                      <span className="text-blue-600 ml-1">{result.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rooms List */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-6 pb-3">
                <h3 className="text-sm font-semibold text-gray-700">Channels</h3>
                <Dialog open={showCreateRoom} onOpenChange={setShowCreateRoom}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                      <DialogDescription>Create a new channel for your team discussions.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Channel name (e.g., general, development)"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && createRoom()}
                        className="h-12"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowCreateRoom(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={createRoom}
                        disabled={!newRoomName.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Create Channel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <ScrollArea className="flex-1 px-6">
                {loadingRooms ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : rooms.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Hash className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">No channels yet</p>
                    <p className="text-xs text-gray-400">Create your first channel to get started</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {rooms.map((room) => (
                      <Button
                        key={room.id}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all ${
                          currentRoomId === room.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => switchRoom(room.id)}
                      >
                        <Hash className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="truncate font-medium">{room.name}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="direct" className="flex-1 flex flex-col m-0">
            {/* User Search */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search people..."
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-6 pb-3">
                <h3 className="text-sm font-semibold text-gray-700">People</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadUsers}
                  className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-6">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      {userSearchQuery ? "No people found" : "No people available"}
                    </p>
                    <p className="text-xs text-gray-400">Try refreshing or adjusting your search</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredUsers.map((userItem) => (
                      <Button
                        key={userItem.id}
                        variant="ghost"
                        className={`w-full justify-start h-auto py-3 px-3 rounded-lg transition-all ${
                          selectedUser?.id === userItem.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => switchToDirectChat(userItem)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="relative">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={userItem.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                                {(userItem.fullName || userItem.username).charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(userItem.status)}`}
                            ></div>
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium truncate">{userItem.fullName || userItem.username}</p>
                            <p className="text-xs text-gray-500 truncate">@{userItem.username}</p>
                          </div>
                          <div className="text-xs text-gray-400 capitalize">{userItem.status}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        {(chatMode === "rooms" && currentRoom) || (chatMode === "direct" && selectedUser) ? (
          <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
            <div className="flex items-center gap-4">
              {chatMode === "rooms" ? (
                <>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900">{currentRoom?.name}</h1>
                    <p className="text-sm text-gray-500">Channel • {currentRoom?.members?.length || 0} members</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser?.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {(selectedUser?.fullName || selectedUser?.username || "").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(selectedUser?.status)}`}
                    ></div>
                  </div>
                  <div>
                    <h1 className="font-semibold text-gray-900">{selectedUser?.fullName || selectedUser?.username}</h1>
                    <p className="text-sm text-gray-500 capitalize">
                      {selectedUser?.status} • @{selectedUser?.username}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {chatMode === "direct" && (
                <>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg hover:bg-gray-100">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg hover:bg-gray-100">
                    <Video className="h-4 w-4" />
                  </Button>
                </>
              )}
              {chatMode === "rooms" && currentRoomId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-lg hover:bg-gray-100"
                  onClick={() => {
                    setShowMemberManagement(true)
                    loadRoomMembers(currentRoomId)
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-lg hover:bg-gray-100">
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          {(chatMode === "rooms" && currentRoom) || (chatMode === "direct" && selectedUser) ? (
            <>
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center gap-3 text-gray-500">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Loading messages...</span>
                      </div>
                    </div>
                  ) : (chatMode === "rooms" ? messages : directMessages).length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {chatMode === "rooms" ? "Welcome to the channel!" : "Start your conversation"}
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        {chatMode === "rooms"
                          ? `This is the beginning of the #${currentRoom?.name} channel. Share ideas, collaborate, and stay connected with your team.`
                          : `This is the beginning of your conversation with ${selectedUser?.fullName || selectedUser?.username}. Say hello!`}
                      </p>
                    </div>
                  ) : (
                    (chatMode === "rooms" ? messages : directMessages).map((message, index) => {
                      const isOwnMessage =
                        chatMode === "rooms"
                          ? message.senderUsername === user?.username
                          : message.senderId === user?.userId

                      const prevMessage = (chatMode === "rooms" ? messages : directMessages)[index - 1]
                      const showAvatar =
                        !prevMessage ||
                        (chatMode === "rooms"
                          ? prevMessage.senderUsername !== message.senderUsername
                          : prevMessage.senderId !== message.senderId)

                      return (
                        <div
                          key={message.id || index}
                          className={`flex gap-4 ${isOwnMessage ? "justify-end" : ""} ${showAvatar ? "mt-6" : "mt-1"}`}
                        >
                          {!isOwnMessage && showAvatar && (
                            <Avatar className="h-10 w-10 mt-1">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                                {(chatMode === "rooms" ? message.senderUsername : selectedUser?.username || "")
                                  .charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {!isOwnMessage && !showAvatar && <div className="w-10"></div>}

                          <div className={`flex-1 max-w-2xl ${isOwnMessage ? "text-right" : ""}`}>
                            {showAvatar && (
                              <div className={`flex items-center gap-3 mb-2 ${isOwnMessage ? "justify-end" : ""}`}>
                                <span className="text-sm font-semibold text-gray-900">
                                  {isOwnMessage
                                    ? "You"
                                    : chatMode === "rooms"
                                      ? message.senderUsername
                                      : selectedUser?.fullName || selectedUser?.username}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(message.createdAt)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`inline-block px-4 py-3 rounded-2xl max-w-full break-words ${
                                isOwnMessage
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                  : "bg-white text-gray-900 shadow-sm border border-gray-100"
                              } ${showAvatar ? "" : "ml-0"}`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>

                              {/* File attachment display */}
                              {message.attachmentUrl && message.attachmentName && (
                                <div className="mt-3 p-3 bg-black/10 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {getFileIcon(message.messageType)}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{message.attachmentName}</p>
                                      {message.attachmentSize && (
                                        <p className="text-xs opacity-75">{formatFileSize(message.attachmentSize)}</p>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:bg-black/10"
                                      onClick={() => window.open(message.attachmentUrl, "_blank")}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {isOwnMessage && (
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <CheckCheck className="h-3 w-3 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {isOwnMessage && showAvatar && (
                            <Avatar className="h-10 w-10 mt-1">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                                {(user?.username || "").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {isOwnMessage && !showAvatar && <div className="w-10"></div>}
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />

                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-3 px-4">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                      </span>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to TaskFlow Chat</h3>
                <p className="text-gray-500 leading-relaxed">
                  {chatMode === "rooms"
                    ? "Select a channel from the sidebar to start collaborating with your team. Create new channels to organize conversations by topic or project."
                    : "Choose someone from your team to start a direct conversation. Share ideas, ask questions, and stay connected."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {((chatMode === "rooms" && currentRoom) || (chatMode === "direct" && selectedUser)) && (
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder={`Message ${chatMode === "rooms" ? `#${currentRoom?.name}` : selectedUser?.fullName || selectedUser?.username}...`}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !e.shiftKey && (chatMode === "rooms" ? sendMessage() : sendDirectMessage())
                  }
                  className="h-12 pr-24 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl"
                  disabled={!isConnected}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg">
                    <Smile className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <Button
                onClick={chatMode === "rooms" ? sendMessage : sendDirectMessage}
                disabled={!isConnected || !newMessage.trim()}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {!isConnected && (
              <div className="mt-3 text-center">
                <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Connection lost - trying to reconnect...
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
