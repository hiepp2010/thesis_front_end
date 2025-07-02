"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Sun, Users, Search, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface TimeBoardEntry {
  id: number
  employeeName: string
  employeeId: string
  authUserId: number
  startDate: string
  endDate: string
  leaveType: string
  leaveTypeDisplay: string
  daysRequested: number
  isCurrentlyOnLeave: boolean
  isEmergency: boolean
  avatarUrl?: string
}

interface TimeBoardData {
  timeBoard: TimeBoardEntry[]
  totalPeopleOff: number
  dateRange: {
    start: string
    end: string
  }
}

interface TimeBoardViewProps {
  onRefresh: () => void
}

export function TimeBoardView({ onRefresh }: TimeBoardViewProps) {
  const { toast } = useToast()
  const [boardData, setBoardData] = useState<TimeBoardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchTimeBoard()
  }, [dateRange])

  const fetchTimeBoard = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      const response = await apiClient.get(`/hrms/time-off/time-board?${params}`)
      setBoardData(response)
    } catch (error) {
      console.error("Error fetching time board:", error)
      toast({
        title: "Error",
        description: "Failed to fetch time board",
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

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    }

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "EMERGENCY":
        return "bg-red-100 text-red-800 border-red-200"
      case "SICK_LEAVE":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "VACATION":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "PERSONAL":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "MATERNITY":
      case "PATERNITY":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredEntries =
    boardData?.timeBoard.filter(
      (entry) =>
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.leaveTypeDisplay.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  // Group entries by date overlap
  const groupedEntries = filteredEntries.reduce(
    (acc, entry) => {
      const key = `${entry.startDate}-${entry.endDate}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(entry)
      return acc
    },
    {} as Record<string, TimeBoardEntry[]>,
  )

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
        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{boardData?.totalPeopleOff || 0}</p>
                <p className="text-sm text-green-700">People On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{Object.keys(groupedEntries).length}</p>
                <p className="text-sm text-blue-700">Leave Periods</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Sun className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">
                  {boardData?.timeBoard.reduce((sum, entry) => sum + entry.daysRequested, 0) || 0}
                </p>
                <p className="text-sm text-purple-700">Total Days</p>
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
                  placeholder="Search employees or leave types..."
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

      {/* Time Board */}
      {filteredEntries.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leave scheduled</h3>
            <p className="text-gray-500">No approved leave requests found for the selected date range.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries)
            .sort(([a], [b]) => new Date(a.split("-")[0]).getTime() - new Date(b.split("-")[0]).getTime())
            .map(([dateKey, entries]) => {
              const [startDate, endDate] = dateKey.split("-")

              return (
                <Card key={dateKey} className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-green-600" />
                          {formatDateRange(startDate, endDate)}
                        </CardTitle>
                        <CardDescription>
                          {entries.length} {entries.length === 1 ? "person" : "people"} on leave
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {entries.reduce((sum, entry) => sum + entry.daysRequested, 0)} total days
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entries.map((entry) => (
                        <Card key={entry.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={entry.avatarUrl || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                                  {getInitials(entry.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 truncate">{entry.employeeName}</h4>
                                  {entry.isEmergency && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                  {entry.isCurrentlyOnLeave && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                                      Currently Away
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{entry.employeeId}</p>

                                <div className="space-y-1 text-sm">
                                  <Badge variant="outline" className={`text-xs ${getTypeColor(entry.leaveType)}`}>
                                    {entry.leaveTypeDisplay}
                                  </Badge>

                                  <div className="flex items-center gap-1 text-gray-600">
                                    <Sun className="h-3 w-3" />
                                    <span>
                                      {entry.daysRequested} {entry.daysRequested === 1 ? "day" : "days"}
                                    </span>
                                  </div>
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
