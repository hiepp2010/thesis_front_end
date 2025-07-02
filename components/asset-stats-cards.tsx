"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, Clock, AlertTriangle } from "lucide-react"

interface AssetStats {
  totalAssets: number
  availableAssets: number
  assignedAssets: number
  pendingRequests: number
  urgentRequests: number
  myActiveRequests: number
  myAssignments: number
  totalValue: number
}

interface AssetStatsCardsProps {
  stats: AssetStats | null
}

export function AssetStatsCards({ stats }: AssetStatsCardsProps) {
  const statsCards = [
    {
      title: "Total Assets",
      value: stats?.totalAssets || 0,
      subtitle: `$${(stats?.totalValue || 0).toLocaleString()} value`,
      icon: Package,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      iconBg: "bg-teal-100",
    },
    {
      title: "Available Assets",
      value: stats?.availableAssets || 0,
      subtitle: "ready for assignment",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100",
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests || 0,
      subtitle: "awaiting approval",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100",
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
