"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, TrendingUp, Users } from "lucide-react"

interface AttendanceStats {
  total_overtime_hours: number
  present_days: number
  total_hours: number
  total_days: number
  absent_days: number
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

interface AttendanceStatsCardsProps {
  stats: AttendanceStats | null
  workingDays: WorkingDaysInfo | null
}

export function AttendanceStatsCards({ stats, workingDays }: AttendanceStatsCardsProps) {
  const attendanceRate = stats && workingDays ? Math.round((stats.present_days / workingDays.workingDays) * 100) : 0

  const averageHoursPerDay =
    stats && stats.present_days > 0 ? Math.round((stats.total_hours / stats.present_days) * 10) / 10 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Present Days */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Present Days</CardTitle>
          <Users className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{stats?.present_days || 0}</div>
          <p className="text-xs text-green-600 mt-1">of {workingDays?.workingDays || 0} working days</p>
          <div className="mt-2">
            <div className="text-xs text-green-700 font-medium">Attendance Rate: {attendanceRate}%</div>
          </div>
        </CardContent>
      </Card>

      {/* Total Hours */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Total Hours</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{stats?.total_hours || 0}h</div>
          <p className="text-xs text-blue-600 mt-1">Avg: {averageHoursPerDay}h per day</p>
          <div className="mt-2">
            <div className="text-xs text-blue-700 font-medium">This month</div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Hours */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Overtime</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{stats?.total_overtime_hours || 0}h</div>
          <p className="text-xs text-purple-600 mt-1">Extra hours worked</p>
          <div className="mt-2">
            <div className="text-xs text-purple-700 font-medium">This month</div>
          </div>
        </CardContent>
      </Card>

      {/* Working Days Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-800">Working Days</CardTitle>
          <Calendar className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-900">{workingDays?.workingDays || 0}</div>
          <p className="text-xs text-amber-600 mt-1">of {workingDays?.totalDays || 0} total days</p>
          <div className="mt-2">
            <div className="text-xs text-amber-700 font-medium">{workingDays?.workingDaysDefinition || "Mon-Thu"}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
