"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Search, Filter, Clock } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  status: string
  clockInTime?: string
  clockOutTime?: string
  totalHours?: number
  department?: string
}

interface TeamAttendanceViewProps {
  onRefresh: () => void
}

export function TeamAttendanceView({ onRefresh }: TeamAttendanceViewProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    fetchTeamAttendance()
  }, [selectedDate])

  const fetchTeamAttendance = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("startDate", selectedDate)
      params.append("endDate", selectedDate)

      const response = await apiClient.get(`/hrms/attendance/team?${params.toString()}`)

      // Mock data since API might return simplified response
      const mockTeamMembers: TeamMember[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john@company.com",
          status: "PRESENT",
          clockInTime: "09:00:00",
          clockOutTime: "18:00:00",
          totalHours: 8,
          department: "Engineering",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@company.com",
          status: "LATE",
          clockInTime: "09:30:00",
          clockOutTime: "18:30:00",
          totalHours: 8,
          department: "Design",
        },
        {
          id: "3",
          name: "Mike Johnson",
          email: "mike@company.com",
          status: "REMOTE_WORK",
          clockInTime: "08:45:00",
          clockOutTime: "17:45:00",
          totalHours: 8,
          department: "Marketing",
        },
        {
          id: "4",
          name: "Sarah Wilson",
          email: "sarah@company.com",
          status: "ABSENT",
          department: "HR",
        },
      ]

      setTeamMembers(mockTeamMembers)
    } catch (error) {
      console.error("Error fetching team attendance:", error)
      setTeamMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200"
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200"
      case "REMOTE_WORK":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "HALF_DAY":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not recorded"

    const [hours, minutes] = timeString.split(":")
    const hour24 = Number.parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? "PM" : "AM"

    return `${hour12}:${minutes} ${ampm}`
  }

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const statusCounts = teamMembers.reduce(
    (acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Team Attendance
        </CardTitle>
        <CardDescription>Monitor your team's attendance and working hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-900">{statusCounts.PRESENT || 0}</div>
            <div className="text-sm text-green-600">Present</div>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-900">{statusCounts.LATE || 0}</div>
            <div className="text-sm text-yellow-600">Late</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-900">{statusCounts.REMOTE_WORK || 0}</div>
            <div className="text-sm text-blue-600">Remote</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-900">{statusCounts.ABSENT || 0}</div>
            <div className="text-sm text-red-600">Absent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline" size="sm" onClick={fetchTeamAttendance}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Team Members List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div key={member.id} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                        {member.department && <p className="text-xs text-gray-400">{member.department}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(member.status)}>{member.status.replace("_", " ")}</Badge>
                      {member.totalHours && <p className="text-sm text-gray-500 mt-1">{member.totalHours}h total</p>}
                    </div>
                  </div>

                  {(member.clockInTime || member.clockOutTime) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">In:</span>
                        <span className="font-medium text-green-700">{formatTime(member.clockInTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500">Out:</span>
                        <span className="font-medium text-blue-700">{formatTime(member.clockOutTime)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No team members found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
