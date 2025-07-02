"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Sun, Timer, TrendingUp } from "lucide-react"

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

interface LeaveStatsCardsProps {
  stats: LeaveStats | null
  boardSummary: TimeBoardSummary | null
}

export function LeaveStatsCards({ stats, boardSummary }: LeaveStatsCardsProps) {
  const statsCards = [
    {
      title: "Currently On Leave",
      value: boardSummary?.currentlyOnLeave || 0,
      subtitle: "people away today",
      icon: Sun,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
    },
    {
      title: "Pending Approval",
      value: stats?.pendingRequests || 0,
      subtitle: "requests waiting",
      icon: Timer,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "This Year Used",
      value: `${stats?.totalDaysUsedThisYear || 0} days`,
      subtitle: `of ${stats?.totalDaysRequestedThisYear || 0} requested`,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Upcoming Leave",
      value: boardSummary?.upcomingLeaveThisMonth || 0,
      subtitle: "this month",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className={`border-0 shadow-lg ${card.bgColor} hover:shadow-xl transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.iconBg}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
