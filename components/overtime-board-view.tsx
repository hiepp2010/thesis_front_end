"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, Search, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface OvertimeBoardEntry {
  id: number
  employeeName: string
  employeeId: string
  authUserId: number
  overtimeDate: string
  startTime: string
  endTime: string
  hoursRequested: number
  overtimeType: string
  overtimeTypeDisplay: string
  projectOrTask?: string
  isToday: boolean
  isWeekend: boolean
  isUrgent: boolean
  avatarUrl?: string
}

interface OvertimeBoardData {
  overtimeBoard: OvertimeBoardEntry[]
  totalPeopleWorking: number
  dateRange: {
    start: string
    end: string
  }
  groupedByDate: { [date: string]: OvertimeBoardEntry[] }
}

interface OvertimeBoardViewProps {
  onRefresh: () => void
}

export function OvertimeBoardView({ onRefresh }: OvertimeBoardViewProps) {
  const { toast } = useToast()
  const [boardData, setBoardData] = useState<OvertimeBoardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchOvertimeBoard()
  }, [dateRange])

  const fetchOvertimeBoard = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      const response = await apiClient.get(`/hrms/overtime/overtime-board?${params}`)
      setBoardData(response)
    } catch (error) {
      console.error("Error fetching overtime board:", error)
      toast({
        title: "Error",
        description: "Failed to fetch overtime board",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }
  }

  const filteredEntries =
    boardData?.overtimeBoard.filter(
      (entry) =>
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.projectOrTask?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.overtimeTypeDisplay.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{boardData?.totalPeopleWorking || 0}</p>
                <p className="text-sm text-blue-700">People Working Overtime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {Object.keys(boardData?.groupedByDate || {}).length}
                </p>
                <p className="text-sm text-green-700">Days with Overtime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {boardData?.overtimeBoard.reduce((sum, entry) => sum + entry.hoursRequested, 0) || 0}h
                </p>
                <p className="text-sm text-purple-700">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search employees, projects, or overtime types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-40"
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Board */}
      {Object.keys(boardData?.groupedByDate || {}).length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No overtime scheduled</h3>
            <p className="text-gray-500">No approved overtime requests found for the selected date range.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(boardData?.groupedByDate || {})
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, entries]) => {
              const filteredDateEntries = entries.filter(
                (entry) =>
                  entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  entry.projectOrTask?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  entry.overtimeTypeDisplay.toLowerCase().includes(searchTerm.toLowerCase()),
              )

              if (filteredDateEntries.length === 0) return null

              return (
                <Card key={date} className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          {formatDate(date)}
                        </CardTitle>
                        <CardDescription>
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {filteredDateEntries.length} {filteredDateEntries.length === 1 ? "person" : "people"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredDateEntries.map((entry) => (
                        <Card key={entry.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={entry.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                  {getInitials(entry.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 truncate">{entry.employeeName}</h4>
                                  {entry.isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{entry.employeeId}</p>

                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {entry.startTime} - {entry.endTime}
                                    </span>
                                    <span className="text-gray-400">({entry.hoursRequested}h)</span>
                                  </div>

                                  <Badge variant="outline" className="text-xs">
                                    {entry.overtimeTypeDisplay}
                                  </Badge>

                                  {entry.projectOrTask && (
                                    <p className="text-xs text-gray-500 truncate">{entry.projectOrTask}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
