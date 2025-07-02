"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Download, Calendar, BarChart3, TrendingUp, Users } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface AttendanceReport {
  employeeName: string
  employeeId: string
  department: string
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  totalHours: number
  overtimeHours: number
  attendanceRate: number
}

interface AttendanceReportsViewProps {
  onRefresh: () => void
}

export function AttendanceReportsView({ onRefresh }: AttendanceReportsViewProps) {
  const [reports, setReports] = useState<AttendanceReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [reportType, setReportType] = useState("summary")

  useEffect(() => {
    fetchReports()
  }, [startDate, endDate, selectedDepartment, reportType])

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)
      if (selectedDepartment !== "all") params.append("department", selectedDepartment)
      params.append("type", reportType)

      const response = await apiClient.get(`/hrms/attendance/reports?${params.toString()}`)

      // Mock data since API might return simplified response
      const mockReports: AttendanceReport[] = [
        {
          employeeName: "John Doe",
          employeeId: "EMP001",
          department: "Engineering",
          totalDays: 22,
          presentDays: 20,
          lateDays: 2,
          absentDays: 2,
          totalHours: 160,
          overtimeHours: 8,
          attendanceRate: 91,
        },
        {
          employeeName: "Jane Smith",
          employeeId: "EMP002",
          department: "Design",
          totalDays: 22,
          presentDays: 22,
          lateDays: 0,
          absentDays: 0,
          totalHours: 176,
          overtimeHours: 0,
          attendanceRate: 100,
        },
        {
          employeeName: "Mike Johnson",
          employeeId: "EMP003",
          department: "Marketing",
          totalDays: 22,
          presentDays: 19,
          lateDays: 1,
          absentDays: 3,
          totalHours: 152,
          overtimeHours: 4,
          attendanceRate: 86,
        },
      ]

      setReports(mockReports)
    } catch (error) {
      console.error("Error fetching attendance reports:", error)
      setReports([])
    } finally {
      setIsLoading(false)
    }
  }

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600"
    if (rate >= 85) return "text-yellow-600"
    return "text-red-600"
  }

  const exportReport = () => {
    // Mock export functionality
    console.log("Exporting report...")
  }

  const departments = ["all", "Engineering", "Design", "Marketing", "HR", "Sales"]

  const totalStats = reports.reduce(
    (acc, report) => ({
      totalEmployees: acc.totalEmployees + 1,
      avgAttendanceRate: acc.avgAttendanceRate + report.attendanceRate,
      totalHours: acc.totalHours + report.totalHours,
      totalOvertimeHours: acc.totalOvertimeHours + report.overtimeHours,
    }),
    { totalEmployees: 0, avgAttendanceRate: 0, totalHours: 0, totalOvertimeHours: 0 },
  )

  if (reports.length > 0) {
    totalStats.avgAttendanceRate = Math.round(totalStats.avgAttendanceRate / reports.length)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Attendance Reports
        </CardTitle>
        <CardDescription>Generate and view comprehensive attendance reports</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Employees</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalStats.totalEmployees}</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Avg Attendance</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{totalStats.avgAttendanceRate}%</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Hours</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{totalStats.totalHours}h</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Overtime</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{totalStats.totalOvertimeHours}h</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto"
              placeholder="Start Date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto"
              placeholder="End Date"
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Reports Table */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report, index) => (
                <div key={index} className="p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{report.employeeName}</h3>
                      <p className="text-sm text-gray-500">
                        {report.employeeId} • {report.department}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getAttendanceRateColor(report.attendanceRate)}`}>
                        {report.attendanceRate}%
                      </div>
                      <p className="text-xs text-gray-500">Attendance Rate</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Present:</span>
                      <span className="font-medium text-green-600 ml-1">
                        {report.presentDays}/{report.totalDays}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Late:</span>
                      <span className="font-medium text-yellow-600 ml-1">{report.lateDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Absent:</span>
                      <span className="font-medium text-red-600 ml-1">{report.absentDays}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Hours:</span>
                      <span className="font-medium text-blue-600 ml-1">{report.totalHours}h</span>
                      {report.overtimeHours > 0 && (
                        <span className="text-purple-600 ml-1">(+{report.overtimeHours}h OT)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reports available</p>
              <p className="text-sm text-gray-400">Try adjusting your filters</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
