"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Square, CheckCircle, AlertCircle } from "lucide-react"

interface TodayStatus {
  date: string
  status: string
  canClockIn: boolean
  canClockOut: boolean
  clockInTime?: string
  clockOutTime?: string
  message?: string
}

interface ClockInOutCardProps {
  todayStatus: TodayStatus | null
  onClockIn: () => void
  onClockOut: () => void
}

export function ClockInOutCard({ todayStatus, onClockIn, onClockOut }: ClockInOutCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800 border-green-200"
      case "LATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ABSENT":
        return "bg-red-100 text-red-800 border-red-200"
      case "NOT_CLOCKED_IN":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PRESENT":
        return <CheckCircle className="h-4 w-4" />
      case "LATE":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Not recorded"

    // Handle different time formats
    if (timeString.includes("T")) {
      return new Date(timeString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    }

    // Handle time-only format (HH:MM:SS.microseconds)
    const timePart = timeString.split(".")[0] // Remove microseconds
    const [hours, minutes] = timePart.split(":")
    const hour24 = Number.parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? "PM" : "AM"

    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-slate-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-600" />
          Time Clock
        </CardTitle>
        <CardDescription>
          Track your daily attendance - {todayStatus?.date || new Date().toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center gap-3">
            {getStatusIcon(todayStatus?.status || "NOT_CLOCKED_IN")}
            <div>
              <p className="font-medium">Current Status</p>
              <Badge className={getStatusColor(todayStatus?.status || "NOT_CLOCKED_IN")}>
                {todayStatus?.status?.replace("_", " ") || "Not Clocked In"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Play className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Clock In</span>
            </div>
            <p className="text-lg font-bold text-green-900">{formatTime(todayStatus?.clockInTime)}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Square className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Clock Out</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{formatTime(todayStatus?.clockOutTime)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {todayStatus?.canClockIn && (
            <Button
              onClick={onClockIn}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          )}

          {todayStatus?.canClockOut && (
            <Button
              onClick={onClockOut}
              className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
            >
              <Square className="h-4 w-4 mr-2" />
              Clock Out
            </Button>
          )}

          {!todayStatus?.canClockIn && !todayStatus?.canClockOut && (
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border text-center">
              <p className="text-sm text-gray-600">{todayStatus?.message || "No actions available"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
