"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Clock, Search, Download } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface AttendanceRecord {
  date: string
  clockInTime?: string
  clockOutTime?: string
  status: string
  totalHours?: number
  overtimeHours?: number
  notes?: string
}

interface MyAttendanceHistoryProps {
  onRefresh: () => void
}

export function MyAttendanceHistory({ onRefresh }: MyAttendanceHistoryProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchAttendanceHistory()
  }, [startDate, endDate])

  const fetchAttendanceHistory = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const response = await apiClient.get(`/hrms/attendance/my-attendance?${params.toString()}`)

      // Mock data since API returns simplified response
      const mockRecords: AttendanceRecord[] = [
        {
          date: "2025-07-01",
          clockInTime: "09:00:00",
          clockOutTime: "18:00:00",
          status: "PRESENT",
          totalHours: 8,
          overtimeHours: 0,
        },
        {
          date: "2025-07-02",
          clockInTime: "09:15:00",
          clockOutTime: "18:30:00",
          status: "LATE",
          totalHours: 8.25,
          overtimeHours: 0.5,
        },
        {
          date: "2025-07-03",
          clockInTime: "09:00:00",
          clockOutTime: "17:45:00",
          status: "EARLY_DEPARTURE",
          totalHours: 7.75,
          overtimeHours: 0,
        },
      ]

      setRecords(mockRecords)
    } catch (error) {
      console.error("Error fetching attendance history:", error)
      setRecords([])
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
      case "EARLY_DEPARTURE":
        return "bg-orange-100 text-orange-800 border-orange-200"
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

  const filteredRecords = records.filter(
    (record) =>
      record.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          My Attendance History
        </CardTitle>
        <CardDescription>View your personal attendance records and working hours</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by date or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto" />
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto" />
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Records List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-3">
              {filteredRecords.map((record, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{record.date}</span>
                      <Badge className={getStatusColor(record.status)}>{record.status.replace("_", " ")}</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.totalHours}h total
                      {record.overtimeHours && record.overtimeHours > 0 && (
                        <span className="text-purple-600 ml-2">+{record.overtimeHours}h OT</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Clock In:</span>
                      <span className="font-medium text-green-700">{formatTime(record.clockInTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Clock Out:</span>
                      <span className="font-medium text-blue-700">{formatTime(record.clockOutTime)}</span>
                    </div>
                  </div>

                  {record.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">{record.notes}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No attendance records found</p>
              <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
