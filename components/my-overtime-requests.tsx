"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, Search, Eye, X, CheckCircle, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface OvertimeRequest {
  id: number
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
  actualHoursWorked?: number
  createdAt: string
  updatedAt: string
  approvedByName?: string
  approvedAt?: string
  rejectionReason?: string
  canCancel: boolean
  canEdit: boolean
  urgent: boolean
  today: boolean
}

interface MyOvertimeRequestsProps {
  onRefresh: () => void
  onViewDetails: (request: OvertimeRequest) => void
}

export function MyOvertimeRequests({ onRefresh, onViewDetails }: MyOvertimeRequestsProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<OvertimeRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/hrms/overtime/my-requests")
      setRequests(response.requests || [])
    } catch (error) {
      console.error("Error fetching my requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your overtime requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      await apiClient.delete(`/hrms/overtime/request/${requestId}`)
      toast({
        title: "Success",
        description: "Overtime request cancelled successfully",
      })
      fetchMyRequests()
      onRefresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to cancel request",
        variant: "destructive",
      })
    }
  }

  const handleCompleteRequest = async (requestId: number, actualHours: number) => {
    try {
      await apiClient.post(`/hrms/overtime/complete/${requestId}`, {
        actualHoursWorked: actualHours,
        notes: "Completed via web interface",
      })
      toast({
        title: "Success",
        description: "Overtime marked as completed",
      })
      fetchMyRequests()
      onRefresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to complete request",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string, urgent: boolean) => {
    const baseClasses = "font-medium"

    switch (status) {
      case "PENDING":
        return (
          <Badge
            className={`${baseClasses} ${urgent ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
          >
            {urgent && <AlertTriangle className="h-3 w-3 mr-1" />}
            Pending
          </Badge>
        )
      case "APPROVED":
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>Approved</Badge>
      case "REJECTED":
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>Rejected</Badge>
      case "COMPLETED":
        return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 border-blue-200`}>Completed</Badge>
      case "CANCELLED":
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>Cancelled</Badge>
      default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>{status}</Badge>
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.projectOrTask?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.overtimeTypeDisplay.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.overtimeType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

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
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="REGULAR">Regular</SelectItem>
                <SelectItem value="WEEKEND">Weekend</SelectItem>
                <SelectItem value="HOLIDAY">Holiday</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="PROJECT_DEADLINE">Project Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No overtime requests found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't submitted any overtime requests yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg">{request.overtimeTypeDisplay}</h3>
                      {getStatusBadge(request.status, request.urgent)}
                      {request.today && <Badge className="bg-blue-100 text-blue-800 border-blue-200">Today</Badge>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(request.overtimeDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {request.startTime && request.endTime
                            ? `${request.startTime} - ${request.endTime}`
                            : `${request.hoursRequested}h`}
                        </span>
                      </div>
                    </div>

                    {request.projectOrTask && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Project:</strong> {request.projectOrTask}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 mb-4">{request.reason}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Hours: {request.hoursRequested}</span>
                      <span>Est. Cost: ${request.estimatedCost}</span>
                      {request.actualHoursWorked && <span>Actual: {request.actualHoursWorked}h</span>}
                    </div>

                    {request.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(request)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    {request.canCancel && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelRequest(request.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}

                    {request.status === "APPROVED" && !request.actualHoursWorked && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteRequest(request.id, request.hoursRequested)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
