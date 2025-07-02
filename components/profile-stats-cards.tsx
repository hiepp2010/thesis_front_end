"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Users, UserCheck, Building, TrendingUp } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { employeeProfileService } from "@/lib/api/employee-profile-service"

interface ProfileStats {
  totalEmployees: number
  activeEmployees: number
  departments: number
  recentUpdates: number
}

export function ProfileStatsCards() {
  const { hasRole } = useAuth()
  const [stats, setStats] = useState<ProfileStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    departments: 0,
    recentUpdates: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (hasRole("HR")) {
          // HR users can see full statistics
          const [statisticsData, allProfiles] = await Promise.all([
            employeeProfileService.getEmployeeStatistics(),
            employeeProfileService.getAllEmployeeProfiles(),
          ])

          // Calculate departments from profiles
          const departments = new Set(allProfiles.map((profile: any) => profile.departmentName).filter(Boolean))

          setStats({
            totalEmployees: statisticsData.totalCount || 0,
            activeEmployees: statisticsData.activeCount || 0,
            departments: departments.size,
            recentUpdates: 15, // This would need to be calculated from profile update timestamps
          })
        } else {
          // Regular users see limited stats from public directory
          const publicDirectory = await employeeProfileService.getPublicDirectory()
          const departments = new Set(publicDirectory.map((emp: any) => emp.departmentName).filter(Boolean))

          setStats({
            totalEmployees: publicDirectory.length,
            activeEmployees: publicDirectory.filter((emp: any) => emp.status === "ACTIVE").length,
            departments: departments.size,
            recentUpdates: 0, // Not available for regular users
          })
        }
      } catch (error) {
        console.error("Failed to fetch profile stats:", error)
        setError(error instanceof Error ? error.message : "Failed to load statistics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [hasRole])

  const cards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: <Users className="h-5 w-5 text-indigo-600" />,
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      change: "Company-wide",
      changeType: "neutral" as const,
    },
    {
      title: "Active Profiles",
      value: stats.activeEmployees,
      icon: <UserCheck className="h-5 w-5 text-green-600" />,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      change:
        stats.totalEmployees > 0
          ? `${Math.round((stats.activeEmployees / stats.totalEmployees) * 100)}% active`
          : "0% active",
      changeType: "neutral" as const,
    },
    {
      title: "Departments",
      value: stats.departments,
      icon: <Building className="h-5 w-5 text-blue-600" />,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      change: "Across organization",
      changeType: "neutral" as const,
    },
    {
      title: "Recent Updates",
      value: stats.recentUpdates,
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      change: "Last 7 days",
      changeType: "neutral" as const,
    },
  ]

  // Show limited stats for non-HR users
  const visibleCards = hasRole("HR") ? cards : cards.slice(0, 2)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load statistics</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {visibleCards.map((card, index) => (
        <motion.div key={card.title} variants={item}>
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`}></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>{card.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
              </div>
              <div className="flex items-center mt-2">
                <Badge variant="secondary" className={`${card.bgColor} ${card.textColor} border-0 text-xs font-medium`}>
                  {card.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
