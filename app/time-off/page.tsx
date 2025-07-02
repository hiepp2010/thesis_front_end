"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar, Sun, TrendingUp, Plus, CheckCircle, Timer, BarChart3, Zap, User, FileText } from "lucide-react"
import { CreateLeaveDialog } from "@/components/create-leave-dialog"
import { LeaveDetailsDialog } from "@/components/leave-details-dialog"
import { LeaveStatsCards } from "@/components/leave-stats-cards"
import { TimeBoardView } from "@/components/time-board-view"
import { MyLeaveRequests } from "@/components/my-leave-requests"
import { LeaveApprovalsView } from "@/components/leave-approvals-view"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"

interface LeaveStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  currentlyOnLeave: number
  upcomingLeave: number
  totalDaysUsedThisYear: number
  totalDaysRequestedThisYear: number
}

interface TimeBoardSummary {
  currentlyOnLeave: number
  upcomingLeaveThisWeek: number
  upcomingLeaveThisMonth: number
  pendingApproval: number
}

export default function TimeOffPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<LeaveStats | null>(null)
  const [boardSummary, setBoardSummary] = useState<TimeBoardSummary | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const isHROrManager = user?.roles?.includes("HR") || user?.roles?.includes("MANAGER")

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsResponse, summaryResponse] = await Promise.all([
        apiClient.get("/hrms/time-off/statistics"),
        apiClient.get("/hrms/time-off/time-board/summary"),
      ])

      setStats(statsResponse)
      setBoardSummary(summaryResponse)
    } catch (error) {
      console.error("Error fetching time-off data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Sun className="h-8 w-8 text-white" />
                </div>
                Time Off Management
              </h1>
              <p className="text-gray-600 mt-1">Manage leave requests, approvals, and time off tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          {/* Stats Cards */}
          <LeaveStatsCards stats={stats} boardSummary={boardSummary} />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="my-requests"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                My Requests
              </TabsTrigger>
              <TabsTrigger
                value="time-board"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Time Board
              </TabsTrigger>
              {isHROrManager && (
                <TabsTrigger
                  value="approvals"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approvals
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common time off management tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="w-full justify-start bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Leave Request
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setActiveTab("my-requests")}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View My Requests
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setActiveTab("time-board")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Check Time Board
                    </Button>
                    {isHROrManager && (
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                        onClick={() => setActiveTab("approvals")}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Review Pending Approvals
                      </Button>
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
                    <CardDescription>Latest time off activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="p-1 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Vacation request approved</p>
                            <p className="text-xs text-gray-500">Summer vacation - 5 days</p>
                          </div>
                          <span className="text-xs text-gray-400">2h ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-1 bg-blue-100 rounded-full">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">New leave request submitted</p>
                            <p className="text-xs text-gray-500">Personal leave - 2 days</p>
                          </div>
                          <span className="text-xs text-gray-400">1d ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="p-1 bg-purple-100 rounded-full">
                            <Sun className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Leave completed</p>
                            <p className="text-xs text-gray-500">Sick leave - 1 day</p>
                          </div>
                          <span className="text-xs text-gray-400">3d ago</span>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Overview Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Monthly Leave Trends
                  </CardTitle>
                  <CardDescription>Leave usage and patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-requests">
              <MyLeaveRequests onRefresh={handleRefresh} onViewDetails={setSelectedRequest} />
            </TabsContent>

            <TabsContent value="time-board">
              <TimeBoardView onRefresh={handleRefresh} />
            </TabsContent>

            {isHROrManager && (
              <TabsContent value="approvals">
                <LeaveApprovalsView onRefresh={handleRefresh} onViewDetails={setSelectedRequest} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <CreateLeaveDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={handleRefresh} />

      {selectedRequest && (
        <LeaveDetailsDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
          onSuccess={handleRefresh}
          canApprove={isHROrManager}
        />
      )}
    </div>
  )
}
