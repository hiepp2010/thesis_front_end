"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  Calendar,
  TrendingUp,
  Play,
  Square,
  BarChart3,
  Users,
  Timer,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { AttendanceStatsCards } from "@/components/attendance-stats-cards"
import { ClockInOutCard } from "@/components/clock-in-out-card"
import { MyAttendanceHistory } from "@/components/my-attendance-history"
import { WorkingDaysCalendar } from "@/components/working-days-calendar"
import { TeamAttendanceView } from "@/components/team-attendance-view"
import { AttendanceReportsView } from "@/components/attendance-reports-view"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"

interface AttendanceStats {
  total_overtime_hours: number
  present_days: number
  total_hours: number
  total_days: number
  absent_days: number
}

interface TodayStatus {
  date: string
  status: string
  canClockIn: boolean
  canClockOut: boolean
  clockInTime?: string
  clockOutTime?: string
  message?: string
}

interface WorkingDaysInfo {
  year: number
  month: number
  totalDays: number
  workingDays: number
  weekendDays: number
  workingDaysDefinition: string
  workingDaysList: string[]
}

export default function WorkingAttendancePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<AttendanceStats | null>(null)
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null)
  const [workingDays, setWorkingDays] = useState<WorkingDaysInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const isHROrManager = user?.roles?.includes("HR") || user?.roles?.includes("MANAGER")

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [summaryResponse, todayResponse, workingDaysResponse] = await Promise.all([
        apiClient.get("/hrms/attendance/summary"),
        apiClient.get("/hrms/attendance/today"),
        apiClient.get("/hrms/attendance/working-days"),
      ])

      setStats(summaryResponse.attendanceStats)
      setTodayStatus(todayResponse)
      setWorkingDays(workingDaysResponse)
    } catch (error) {
      console.error("Error fetching attendance data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleClockIn = async () => {
    try {
      await apiClient.post("/hrms/attendance/clock-in")
      handleRefresh()
    } catch (error) {
      console.error("Error clocking in:", error)
    }
  }

  const handleClockOut = async () => {
    try {
      await apiClient.post("/hrms/attendance/clock-out")
      handleRefresh()
    } catch (error) {
      console.error("Error clocking out:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                Working Attendance
              </h1>
              <p className="text-gray-600 mt-1">Track time, manage attendance, and monitor working hours</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="flex items-center gap-2">
                {todayStatus?.canClockIn && (
                  <Button
                    onClick={handleClockIn}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Clock In
                  </Button>
                )}
                {todayStatus?.canClockOut && (
                  <Button
                    onClick={handleClockOut}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Clock Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <AttendanceStatsCards stats={stats} workingDays={workingDays} />

          {/* Clock In/Out Card */}
          <ClockInOutCard todayStatus={todayStatus} onClockIn={handleClockIn} onClockOut={handleClockOut} />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="my-attendance"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Timer className="h-4 w-4" />
                My Attendance
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Working Days
              </TabsTrigger>
              {isHROrManager && (
                <TabsTrigger
                  value="team"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
                >
                  <Users className="h-4 w-4" />
                  Team
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Today's Summary */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      Today's Summary
                    </CardTitle>
                    <CardDescription>Your attendance status for today</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        {todayStatus?.status === "PRESENT" ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : todayStatus?.status === "LATE" ? (
                          <AlertCircle className="h-6 w-6 text-yellow-600" />
                        ) : (
                          <Clock className="h-6 w-6 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">Status: {todayStatus?.status || "Not Clocked In"}</p>
                          <p className="text-sm text-gray-500">{todayStatus?.date}</p>
                        </div>
                      </div>
                    </div>

                    {todayStatus?.clockInTime && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-800">Clock In Time</p>
                        <p className="text-lg font-bold text-green-900">{todayStatus.clockInTime}</p>
                      </div>
                    )}

                    {todayStatus?.clockOutTime && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Clock Out Time</p>
                        <p className="text-lg font-bold text-blue-900">{todayStatus.clockOutTime}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest attendance activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="p-1 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Clocked in on time</p>
                            <p className="text-xs text-gray-500">Today at 9:00 AM</p>
                          </div>
                          <span className="text-xs text-gray-400">Today</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-1 bg-blue-100 rounded-full">
                            <Timer className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Full day completed</p>
                            <p className="text-xs text-gray-500">8 hours worked</p>
                          </div>
                          <span className="text-xs text-gray-400">Yesterday</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                          <div className="p-1 bg-yellow-100 rounded-full">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Late arrival</p>
                            <p className="text-xs text-gray-500">15 minutes late</p>
                          </div>
                          <span className="text-xs text-gray-400">2 days ago</span>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Trends Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Monthly Attendance Trends
                  </CardTitle>
                  <CardDescription>Attendance patterns and working hours over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-attendance">
              <MyAttendanceHistory onRefresh={handleRefresh} />
            </TabsContent>

            <TabsContent value="calendar">
              <WorkingDaysCalendar workingDays={workingDays} />
            </TabsContent>

            {isHROrManager && (
              <TabsContent value="team">
                <div className="space-y-6">
                  <TeamAttendanceView onRefresh={handleRefresh} />
                  {user?.roles?.includes("HR") && <AttendanceReportsView onRefresh={handleRefresh} />}
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
