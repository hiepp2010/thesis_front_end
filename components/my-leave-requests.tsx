"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Sun, Search, Eye, X, AlertTriangle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface LeaveRequest {
  id: number
  startDate: string
  endDate: string
  leaveType: string
  leaveTypeDisplay: string
  status: string
  statusDisplay: string
  reason: string
  daysRequested: number
  createdAt: string
  updatedAt: string
  approvedByName?: string
  approvedAt?: string
  rejectionReason?: string
  canCancel: boolean
  canEdit: boolean
  emergency: boolean
  currentlyOnLeave: boolean
}

interface MyLeaveRequestsProps {
  onRefresh: () => void
  onViewDetails: (request: LeaveRequest) => void
}

export function MyLeaveRequests({ onRefresh, onViewDetails }: MyLeaveRequestsProps) {
  const { toast } = useToast()
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [totalRequests, setTotalRequests] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => {
    fetchMyRequests()
  }, [])

  const fetchMyRequests = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get("/hrms/time-off/my-requests")
      setRequests(response.requests || [])
      setTotalRequests(response.totalRequests || 0)
      setPendingRequests(response.pendingRequests || 0)
    } catch (error) {
      console.error("Error fetching my requests:", error)
      toast({
        title: "Error",
        description: "Failed to fetch your leave requests",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRequest = async (requestId: number) => {
    try {
      await apiClient.delete(`/hrms/time-off/request/${requestId}`)
      toast({
        title: "Success",
        description: "Leave request cancelled successfully",
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

  const getStatusBadge = (status: string, emergency: boolean, currentlyOnLeave: boolean) => {
    const baseClasses = "font-medium"

    if (currentlyOnLeave) {
      return <Badge className={`${baseClasses} bg-blue-100 text-blue-800 border-blue-200`}>Currently On Leave</Badge>
    }

    switch (status) {
      case "PENDING":
        return (
          <Badge
            className={`${baseClasses} ${emergency ? "bg-red-100 text-red-800 border-red-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
          >
            {emergency && <AlertTriangle className="h-3 w-3 mr-1" />}
            Pending
          </Badge>
        )
      case "APPROVED":
        return <Badge className={`${baseClasses} bg-green-100 text-green-800 border-green-200`}>Approved</Badge>
      case "REJECTED":
        return <Badge className={`${baseClasses} bg-red-100 text-red-800 border-red-200`}>Rejected</Badge>
      case "CANCELLED":
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>Cancelled</Badge>
      default:
        return <Badge className={`${baseClasses} bg-gray-100 text-gray-800 border-gray-200`}>{status}</Badge>
    }
  }

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leaveTypeDisplay.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || request.status === statusFilter
    const matchesType = typeFilter === "all" || request.leaveType === typeFilter

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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sun className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{totalRequests}</p>
                <p className="text-sm text-green-600">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">{pendingRequests}</p>
                <p className="text-sm text-orange-600">Pending Approval</p>
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
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="VACATION">Vacation</SelectItem>
                <SelectItem value="SICK_LEAVE">Sick Leave</SelectItem>
                <SelectItem value="PERSONAL">Personal</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
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
              <Sun className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "You haven't submitted any leave requests yet."}
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
                      <h3 className="font-semibold text-lg">{request.leaveTypeDisplay}</h3>
                      {getStatusBadge(request.status, request.emergency, request.currentlyOnLeave)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Sun className="h-4 w-4" />
                        <span>
                          {request.daysRequested} {request.daysRequested === 1 ? "day" : "days"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{request.reason}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                      {request.approvedByName && <span>Approved by: {request.approvedByName}</span>}
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
