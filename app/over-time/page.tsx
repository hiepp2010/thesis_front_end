"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, Calendar, TrendingUp, Plus, CheckCircle, Timer, BarChart3, Zap, User, FileText } from "lucide-react"
import { CreateOvertimeDialog } from "@/components/create-overtime-dialog"
import { OvertimeDetailsDialog } from "@/components/overtime-details-dialog"
import { OvertimeStatsCards } from "@/components/overtime-stats-cards"
import { OvertimeBoardView } from "@/components/overtime-board-view"
import { MyOvertimeRequests } from "@/components/my-overtime-requests"
import { PendingApprovalsView } from "@/components/pending-approvals-view"
import { useAuth } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"

interface OvertimeStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  urgentRequests: number
  todaysOvertime: number
  upcomingOvertime: number
  totalHoursThisYear: number
  totalHoursThisMonth: number
  totalEstimatedCostThisMonth: number
  averageHoursPerRequest: number
}

interface OvertimeBoardSummary {
  todaysOvertime: number
  tomorrowsOvertime: number
  thisWeeksOvertime: number
  pendingApproval: number
  urgentRequests: number
  thisWeeksHours: number
  thisMonthsHours: number
}

export default function OvertimePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState<OvertimeStats | null>(null)
  const [boardSummary, setBoardSummary] = useState<OvertimeBoardSummary | null>(null)
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
        apiClient.get("/hrms/overtime/statistics"),
        apiClient.get("/hrms/overtime/overtime-board/summary"),
      ])

      setStats(statsResponse)
      setBoardSummary(summaryResponse)
    } catch (error) {
      console.error("Error fetching overtime data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                Overtime Management
              </h1>
              <p className="text-gray-600 mt-1">Manage overtime requests, approvals, and tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          <OvertimeStatsCards stats={stats} boardSummary={boardSummary} />

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:inline-flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="my-requests"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                My Requests
              </TabsTrigger>
              <TabsTrigger
                value="board"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <Calendar className="h-4 w-4" />
                Overtime Board
              </TabsTrigger>
              {isHROrManager && (
                <TabsTrigger
                  value="approvals"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approvals
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common overtime management tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit New Overtime Request
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
                      onClick={() => setActiveTab("board")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Check Overtime Board
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
                      <Timer className="h-5 w-5 text-green-600" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Latest overtime activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="p-1 bg-green-100 rounded-full">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Overtime request approved</p>
                            <p className="text-xs text-gray-500">Project deadline work - 4 hours</p>
                          </div>
                          <span className="text-xs text-gray-400">2h ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="p-1 bg-blue-100 rounded-full">
                            <Plus className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">New overtime request submitted</p>
                            <p className="text-xs text-gray-500">Emergency maintenance - 6 hours</p>
                          </div>
                          <span className="text-xs text-gray-400">1d ago</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                          <div className="p-1 bg-purple-100 rounded-full">
                            <Timer className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Overtime completed</p>
                            <p className="text-xs text-gray-500">Weekend work - 8 hours</p>
                          </div>
                          <span className="text-xs text-gray-400">2d ago</span>
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
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Monthly Overtime Trends
                  </CardTitle>
                  <CardDescription>Overtime hours and costs over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg">
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
              <MyOvertimeRequests onRefresh={handleRefresh} onViewDetails={setSelectedRequest} />
            </TabsContent>

            <TabsContent value="board">
              <OvertimeBoardView onRefresh={handleRefresh} />
            </TabsContent>

            {isHROrManager && (
              <TabsContent value="approvals">
                <PendingApprovalsView onRefresh={handleRefresh} onViewDetails={setSelectedRequest} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <CreateOvertimeDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSuccess={handleRefresh} />

      {selectedRequest && (
        <OvertimeDetailsDialog
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
