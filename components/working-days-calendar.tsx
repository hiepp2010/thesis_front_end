"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Info } from "lucide-react"

interface WorkingDaysInfo {
  year: number
  month: number
  totalDays: number
  workingDays: number
  weekendDays: number
  workingDaysDefinition: string
  workingDaysList: string[]
}

interface WorkingDaysCalendarProps {
  workingDays: WorkingDaysInfo | null
}

export function WorkingDaysCalendar({ workingDays }: WorkingDaysCalendarProps) {
  if (!workingDays) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading working days information...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const isWorkingDay = (dateString: string) => {
    return workingDays.workingDaysList.includes(dateString)
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`
  }

  const daysInMonth = getDaysInMonth(workingDays.year, workingDays.month)
  const firstDay = getFirstDayOfMonth(workingDays.year, workingDays.month)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="space-y-6">
      {/* Working Days Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Working Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-2">{workingDays.workingDays}</div>
            <p className="text-sm text-blue-600">out of {workingDays.totalDays} total days</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-900 mb-2">{workingDays.workingDaysDefinition}</div>
            <p className="text-sm text-green-600">Working schedule</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-purple-600" />
              Weekend Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-2">{workingDays.weekendDays}</div>
            <p className="text-sm text-purple-600">Non-working days</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            {monthNames[workingDays.month - 1]} {workingDays.year} Calendar
          </CardTitle>
          <CardDescription>Working days are highlighted in green, weekends in gray</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
                <span>Working Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded"></div>
                <span>Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 border border-blue-300 rounded"></div>
                <span>Today</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="p-2 h-10"></div>
                }

                const dateString = formatDate(workingDays.year, workingDays.month, day)
                const isWorking = isWorkingDay(dateString)
                const isToday = dateString === new Date().toISOString().split("T")[0]

                return (
                  <div
                    key={day}
                    className={`
                      p-2 h-10 flex items-center justify-center text-sm border rounded
                      ${
                        isToday
                          ? "bg-blue-200 border-blue-300 text-blue-900 font-bold"
                          : isWorking
                            ? "bg-green-100 border-green-200 text-green-800 hover:bg-green-200"
                            : "bg-gray-100 border-gray-200 text-gray-600"
                      }
                      transition-colors cursor-pointer
                    `}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
