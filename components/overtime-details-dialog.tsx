"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Calendar, User, DollarSign, FileText, AlertTriangle, CheckCircle } from "lucide-react"

interface OvertimeDetailsDialogProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  canApprove?: boolean
}

export function OvertimeDetailsDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
  canApprove = false,
}: OvertimeDetailsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!request) return null

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Overtime Request Details
          </DialogTitle>
          <DialogDescription>Complete information about this overtime request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={request.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {getInitials(request.employeeName || "Unknown")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{request.employeeName}</h3>
                  <p className="text-sm text-gray-600">{request.employeeId}</p>
                  {request.department && <p className="text-sm text-gray-500">{request.department}</p>}
                  {request.employeeEmail && <p className="text-sm text-gray-500">{request.employeeEmail}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Request Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                {getStatusBadge(request.status, request.urgent)}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-gray-600">{new Date(request.overtimeDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-gray-600">
                      {request.startTime && request.endTime
                        ? `${request.startTime} - ${request.endTime}`
                        : `${request.hoursRequested} hours`}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-1">Overtime Type</p>
                <Badge variant="outline">{request.overtimeTypeDisplay}</Badge>
              </div>

              {request.projectOrTask && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Project/Task</p>
                    <p className="text-sm text-gray-600">{request.projectOrTask}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <p className="text-sm font-medium mb-1">Reason</p>
                <p className="text-sm text-gray-600">{request.reason}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Hours Requested</p>
                  <p className="text-lg font-semibold text-blue-600">{request.hoursRequested}h</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rate</p>
                  <p className="text-lg font-semibold text-green-600">${request.estimatedRate}/hr</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Estimated Cost</p>
                  <p className="text-lg font-semibold text-purple-600">${request.estimatedCost}</p>
                </div>
              </div>

              {request.actualHoursWorked && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium">Actual Hours Worked</p>
                    <p className="text-lg font-semibold text-blue-600">{request.actualHoursWorked}h</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Approval Information */}
          {(request.approvedByName || request.rejectionReason) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-4 w-4" />
                  Approval Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {request.approvedByName && (
                  <div>
                    <p className="text-sm font-medium">Approved By</p>
                    <p className="text-sm text-gray-600">{request.approvedByName}</p>
                  </div>
                )}

                {request.approvedAt && (
                  <div>
                    <p className="text-sm font-medium">Approved At</p>
                    <p className="text-sm text-gray-600">{new Date(request.approvedAt).toLocaleString()}</p>
                  </div>
                )}

                {request.rejectionReason && (
                  <div>
                    <p className="text-sm font-medium">Rejection Reason</p>
                    <p className="text-sm text-gray-600 p-3 bg-red-50 border border-red-200 rounded-lg">
                      {request.rejectionReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Employee Overtime History */}
          {(request.totalOvertimeHoursThisYear || request.totalOvertimeHoursThisMonth) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Employee Overtime History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">This Month</p>
                    <p className="text-lg font-semibold text-blue-600">{request.totalOvertimeHoursThisMonth || 0}h</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">This Year</p>
                    <p className="text-lg font-semibold text-purple-600">{request.totalOvertimeHoursThisYear || 0}h</p>
                  </div>
                </div>

                {request.hasOverlappingRequests && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-medium text-amber-800">Overlapping Requests</p>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      This employee has other overtime requests for overlapping time periods.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>{new Date(request.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
