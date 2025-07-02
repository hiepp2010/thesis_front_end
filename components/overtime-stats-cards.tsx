"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, TrendingUp, AlertTriangle, Timer } from "lucide-react"

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

interface OvertimeStatsCardsProps {
  stats: OvertimeStats | null
  boardSummary: OvertimeBoardSummary | null
}

export function OvertimeStatsCards({ stats, boardSummary }: OvertimeStatsCardsProps) {
  const statsCards = [
    {
      title: "Today's Overtime",
      value: boardSummary?.todaysOvertime || 0,
      subtitle: "people working",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
    },
    {
      title: "Pending Approval",
      value: stats?.pendingRequests || 0,
      subtitle: "requests waiting",
      icon: Timer,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
    },
    {
      title: "This Month",
      value: `${stats?.totalHoursThisMonth || 0}h`,
      subtitle: `$${stats?.totalEstimatedCostThisMonth || 0}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Urgent Requests",
      value: stats?.urgentRequests || 0,
      subtitle: "need attention",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      iconBg: "bg-red-100",
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
