"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Search,
  Filter,
  Hash,
  MessageSquare,
  FileText,
  ImageIcon,
  Paperclip,
  Clock,
  Copy,
  Bookmark,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Video,
  Music,
} from "lucide-react"

// Configuration
const API_GATEWAY_URL = " https://fa1b-116-96-45-162.ngrok-free.app"

interface SearchMessage {
  id: string
  messageId: number
  chatRoomId: number
  chatRoomName: string
  senderId: number
  senderUsername: string
  senderFullName: string
  content: string
  messageType: string
  replyToId: number | null
  attachmentUrl: string | null
  attachmentName: string | null
  attachmentSize: number | null
  isEdited: boolean | null
  isDeleted: boolean | null
  createdAt: number[]
  updatedAt: number[]
  indexedAt: number[]
}

interface SearchResponse {
  content: SearchMessage[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

interface ChatUser {
  id: number
  userId?: number
  username: string
  email: string
  fullName?: string
  avatar?: string
  token?: string
  accessToken?: string
}

export default function ChatSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<ChatUser | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [searchResults, setSearchResults] = useState<SearchMessage[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Filter state
  const [messageType, setMessageType] = useState("ALL")
  const [selectedChannel, setSelectedChannel] = useState("ALL")
  const [selectedSender, setSelectedSender] = useState("ALL")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState("desc")
  const [pageSize, setPageSize] = useState(20)

  // Data for filters
  const [channels, setChannels] = useState<{ id: number; name: string }[]>([])
  const [senders, setSenders] = useState<{ id: number; username: string; fullName: string }[]>([])

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
    } else {
      router.push("/chat")
    }
  }, [router])

  // Load initial data
  useEffect(() => {
    if (user && searchParams.get("q")) {
      performSearch()
    }
  }, [user])

  // Format timestamp array to readable date
  const formatTimestamp = (timestamp: number[]) => {
    try {
      const [year, month, day, hour, minute, second] = timestamp
      const date = new Date(year, month - 1, day, hour, minute, second)
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        full: date.toLocaleString(),
      }
    } catch (error) {
      return { date: "Invalid", time: "Invalid", full: "Invalid Date" }
    }
  }

  // Get message type icon
  const getMessageTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "text":
        return <MessageSquare className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "file":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  // Get message type color
  const getMessageTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "text":
        return "bg-blue-100 text-blue-700"
      case "image":
        return "bg-green-100 text-green-700"
      case "file":
        return "bg-purple-100 text-purple-700"
      case "video":
        return "bg-red-100 text-red-700"
      case "audio":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
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

  // Perform search
  const performSearch = async (page = 0) => {
    if (!searchQuery.trim() || !user) return

    try {
      setIsSearching(true)
      const token = user.token || user.accessToken

      const searchPayload = {
        query: searchQuery,
        page,
        size: pageSize,
        sortBy,
        sortDirection,
        ...(messageType !== "ALL" && { messageType }),
        ...(selectedChannel !== "ALL" && { chatRoomId: Number.parseInt(selectedChannel) }),
        ...(selectedSender !== "ALL" && { senderId: Number.parseInt(selectedSender) }),
      }

      const response = await fetch(`${API_GATEWAY_URL}/api/chat/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(searchPayload),
      })

      if (response.ok) {
        const searchData: SearchResponse = await response.json()
        setSearchResults(searchData.content || [])
        setTotalResults(searchData.totalElements)
        setCurrentPage(searchData.number)
        setTotalPages(searchData.totalPages)

        // Extract unique channels and senders for filters
        const uniqueChannels = Array.from(
          new Map(
            searchData.content.map((msg) => [msg.chatRoomId, { id: msg.chatRoomId, name: msg.chatRoomName }]),
          ).values(),
        )
        const uniqueSenders = Array.from(
          new Map(
            searchData.content.map((msg) => [
              msg.senderId,
              { id: msg.senderId, username: msg.senderUsername, fullName: msg.senderFullName },
            ]),
          ).values(),
        )

        setChannels(uniqueChannels)
        setSenders(uniqueSenders)
      } else {
        console.error("Search failed:", response.statusText)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(0)
    performSearch(0)
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    performSearch(newPage)
  }

  // Copy message content
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // You could add a toast notification here
  }

  // Navigate to channel
  const navigateToChannel = (chatRoomId: number) => {
    router.push(`/chat?room=${chatRoomId}`)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/chat")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">Advanced Search</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500">{totalResults > 0 && `${totalResults} results found`}</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">Search Filters</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Search Query</label>
                    <Input
                      placeholder="Enter search terms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Message Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Message Type</label>
                    <Select value={messageType} onValueChange={setMessageType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Types</SelectItem>
                        <SelectItem value="TEXT">Text Messages</SelectItem>
                        <SelectItem value="IMAGE">Images</SelectItem>
                        <SelectItem value="FILE">Files</SelectItem>
                        <SelectItem value="VIDEO">Videos</SelectItem>
                        <SelectItem value="AUDIO">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Channel Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Channel</label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Channels</SelectItem>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id.toString()}>
                            #{channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sender Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sender</label>
                    <Select value={selectedSender} onValueChange={setSelectedSender}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Senders</SelectItem>
                        {senders.map((sender) => (
                          <SelectItem key={sender.id} value={sender.id.toString()}>
                            {sender.fullName} (@{sender.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="updatedAt">Date Updated</SelectItem>
                        <SelectItem value="senderUsername">Sender</SelectItem>
                        <SelectItem value="chatRoomName">Channel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort Direction */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Sort Order</label>
                    <Select value={sortDirection} onValueChange={setSortDirection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Results Per Page */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Results Per Page</label>
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number.parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 results</SelectItem>
                        <SelectItem value="20">20 results</SelectItem>
                        <SelectItem value="50">50 results</SelectItem>
                        <SelectItem value="100">100 results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Messages
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-600">Searching messages...</p>
                </div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? "No messages found" : "Start your search"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {searchQuery
                    ? "Try adjusting your search terms or filters to find what you're looking for."
                    : "Enter a search query and use the filters to find specific messages across all your conversations."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Search Results ({totalResults} found)</h2>
                  <div className="text-sm text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </div>
                </div>

                {/* Message Results */}
                <div className="space-y-4">
                  {searchResults.map((message) => {
                    const timestamp = formatTimestamp(message.createdAt)
                    return (
                      <Card key={message.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <Avatar className="h-10 w-10 mt-1">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                                {message.senderFullName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>

                            {/* Message Content */}
                            <div className="flex-1 min-w-0">
                              {/* Message Header */}
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-semibold text-gray-900">{message.senderFullName}</span>
                                <span className="text-sm text-gray-500">@{message.senderUsername}</span>
                                <Badge className={`text-xs ${getMessageTypeColor(message.messageType)}`}>
                                  {getMessageTypeIcon(message.messageType)}
                                  <span className="ml-1">{message.messageType}</span>
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  <span title={timestamp.full}>
                                    {timestamp.date} at {timestamp.time}
                                  </span>
                                </div>
                              </div>

                              {/* Channel Info */}
                              <div className="flex items-center gap-2 mb-3">
                                <Hash className="h-4 w-4 text-gray-400" />
                                <button
                                  onClick={() => navigateToChannel(message.chatRoomId)}
                                  className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                                >
                                  {message.chatRoomName}
                                </button>
                              </div>

                              {/* Message Content */}
                              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                                <p className="text-gray-900 leading-relaxed">{message.content}</p>
                              </div>

                              {/* Attachment Info */}
                              {message.attachmentName && (
                                <div className="flex items-center gap-2 mb-3 p-3 bg-blue-50 rounded-lg">
                                  <Paperclip className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm text-blue-700 font-medium">{message.attachmentName}</span>
                                  {message.attachmentSize && (
                                    <span className="text-xs text-blue-600">
                                      ({formatFileSize(message.attachmentSize)})
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Message Metadata */}
                              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                {message.isEdited && <Badge variant="outline">Edited</Badge>}
                                {message.replyToId && <span>Reply to message #{message.replyToId}</span>}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigateToChannel(message.chatRoomId)}
                                  className="text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Go to Channel
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyMessage(message.content)}
                                  className="text-xs"
                                >
                                  <Copy className="h-3 w-3 mr-1" />
                                  Copy
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs bg-transparent">
                                  <Bookmark className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-6">
                    <div className="text-sm text-gray-500">
                      Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalResults)} of{" "}
                      {totalResults} results
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum + 1}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
