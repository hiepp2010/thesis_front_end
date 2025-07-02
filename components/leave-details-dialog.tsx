"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Sun, User, FileText, AlertTriangle, CheckCircle } from "lucide-react"

interface LeaveDetailsDialogProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  canApprove?: boolean
}

export function LeaveDetailsDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
  canApprove = false,
}: LeaveDetailsDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  if (!request) return null

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
            <Sun className="h-5 w-5 text-green-600" />
            Leave Request Details
          </DialogTitle>
          <DialogDescription>Complete information about this leave request</DialogDescription>
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
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
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
                {getStatusBadge(request.status, request.emergency, request.currentlyOnLeave)}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-gray-600">{new Date(request.startDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-gray-600">{new Date(request.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Leave Type</p>
                  <Badge variant="outline">{request.leaveTypeDisplay}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-gray-600">
                      {request.daysRequested} {request.daysRequested === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-1">Reason</p>
                <p className="text-sm text-gray-600">{request.reason}</p>
              </div>
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

          {/* Employee Leave Balance */}
          {(request.remainingDaysThisYear !== undefined || request.usedDaysThisYear !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Employee Leave Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Used This Year</p>
                    <p className="text-lg font-semibold text-blue-600">{request.usedDaysThisYear || 0} days</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Remaining This Year</p>
                    <p className="text-lg font-semibold text-green-600">{request.remainingDaysThisYear || 0} days</p>
                  </div>
                </div>

                {request.hasOverlappingRequests && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-medium text-amber-800">Overlapping Requests</p>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      This employee has other leave requests for overlapping time periods.
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
