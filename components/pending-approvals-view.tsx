"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Clock, Calendar, Search, CheckCircle, X, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface PendingRequest {
  id: number
  employeeName: string
  employeeId: string
  authUserId: number
  employeeEmail: string
  department: string
  overtimeDate: string
  startTime?: string
  endTime?: string
  hoursRequested: number
  overtimeType: string
  overtimeTypeDisplay: string
  status: string
  statusDisplay: string
  reason: string
  projectOrTask?: string
  estimatedRate: number
  estimatedCost: number
  canApprove: boolean
  canReject: boolean
  totalOvertimeHoursThisYear: number
  totalOvertimeHoursThisMonth: number
  hasOverlappingRequests: boolean
  urgent: boolean
  createdAt: string
}

interface PendingApprovalsViewProps {
  onRefresh: () => void
  onViewDetails: (request: PendingRequest) => void
}

export function PendingApprovalsView({ onRefresh, onViewDetails }: PendingApprovalsViewProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [urgentRequests, setUrgentRequests] = useState<PendingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processAction, setProcessAction] = useState<"approve" | "reject" | null>(null)
  const [processReason, setProcessReason] = useState("")
  const [estimatedRate, setEstimatedRate] = useState("")

  useEffect(() => {
    fetchPendingRequests()
    fetchUrgentRequests()
  }, [])

  const fetchPendingRequests = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/hrms/overtime/pending")
      setRequests(response.requests || [])
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch pending requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUrgentRequests = async () => {
    try {
      const response = await apiClient.get("/hrms/overtime/urgent")
      setUrgentRequests(response.requests || [])
    } catch (error) {
      console.error("Error fetching urgent requests:", error)
    }
  }

  const handleProcessRequest = async () => {
    if (!selectedRequest || !processAction) return

    setIsProcessing(true)
    try {
      const requestData: any = {
        action: processAction.toUpperCase(),
        reason: processReason,
      }

      if (processAction === "approve" && estimatedRate) {
        requestData.estimatedRate = Number.parseFloat(estimatedRate)
      }

      await apiClient.post(`/hrms/overtime/process/${selectedRequest.id}`, requestData)

      toast({
        title: "Success",
        description: `Overtime request ${processAction}d successfully`,
      })

      setSelectedRequest(null)
      setProcessAction(null)
      setProcessReason("")
      setEstimatedRate("")
      fetchPendingRequests()
      fetchUrgentRequests()
      onRefresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to ${processAction} request`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openProcessDialog = (request: PendingRequest, action: "approve" | "reject") => {
    setSelectedRequest(request)
    setProcessAction(action)
    setEstimatedRate(request.estimatedRate.toString())
    setProcessReason("")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredRequests = requests.filter(
    (request) =>
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projectOrTask?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Urgent Requests Alert */}
      {urgentRequests.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Urgent Requests Requiring Immediate Attention
            </CardTitle>
            <CardDescription className="text-red-700">
              {urgentRequests.length} urgent overtime {urgentRequests.length === 1 ? "request" : "requests"} need
              immediate approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {urgentRequests.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-500 text-white text-xs">
                        {getInitials(request.employeeName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{request.employeeName}</p>
                      <p className="text-xs text-gray-600">
                        {request.overtimeTypeDisplay} - {request.hoursRequested}h
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openProcessDialog(request, "approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openProcessDialog(request, "reject")}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee name, department, project, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-500">
                {searchTerm ? "No requests match your search criteria." : "All overtime requests have been processed."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(request.employeeName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {request.employeeName}
                          {request.urgent && (
                            <Badge className="bg-red-100 text-red-800 border-red-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.employeeId} • {request.department}
                        </p>
                        <p className="text-xs text-gray-500">{request.employeeEmail}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{new Date(request.overtimeDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {request.startTime && request.endTime
                            ? `${request.startTime} - ${request.endTime}`
                            : `${request.hoursRequested}h`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">${request.estimatedCost}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">{request.totalOvertimeHoursThisMonth}h this month</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {request.overtimeTypeDisplay}
                        </Badge>
                        {request.projectOrTask && (
                          <p className="text-sm text-gray-600">
                            <strong>Project:</strong> {request.projectOrTask}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Reason:</p>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Year Total: {request.totalOvertimeHoursThisYear}h</span>
                        <span>Month Total: {request.totalOvertimeHoursThisMonth}h</span>
                        {request.hasOverlappingRequests && (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                            Overlapping Requests
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      onClick={() => openProcessDialog(request, "approve")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => openProcessDialog(request, "reject")}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onViewDetails(request)}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Process Dialog */}
      <Dialog
        open={!!selectedRequest && !!processAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null)
            setProcessAction(null)
            setProcessReason("")
            setEstimatedRate("")
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {processAction === "approve" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <X className="h-5 w-5 text-red-600" />
              )}
              {processAction === "approve" ? "Approve" : "Reject"} Overtime Request
            </DialogTitle>
            <DialogDescription>
              {processAction === "approve"
                ? `Approve overtime request for ${selectedRequest?.employeeName}`
                : `Reject overtime request for ${selectedRequest?.employeeName}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {processAction === "approve" && (
              <div className="space-y-2">
                <Label htmlFor="estimatedRate">Estimated Rate ($/hour)</Label>
                <Input
                  id="estimatedRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={estimatedRate}
                  onChange={(e) => setEstimatedRate(e.target.value)}
                  placeholder="25.00"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="processReason">
                {processAction === "approve" ? "Approval Notes (Optional)" : "Rejection Reason *"}
              </Label>
              <Textarea
                id="processReason"
                value={processReason}
                onChange={(e) => setProcessReason(e.target.value)}
                placeholder={
                  processAction === "approve"
                    ? "Add any notes about this approval..."
                    : "Provide a reason for rejection..."
                }
                rows={3}
                required={processAction === "reject"}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null)
                setProcessAction(null)
                setProcessReason("")
                setEstimatedRate("")
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProcessRequest}
              disabled={isProcessing || (processAction === "reject" && !processReason.trim())}
              className={
                processAction === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              }
            >
              {isProcessing ? "Processing..." : processAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
