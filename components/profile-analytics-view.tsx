"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { BarChart3, Users, TrendingUp, Building, UserCheck, Clock, Briefcase, MapPin } from "lucide-react"
import { employeeProfileService } from "@/lib/api/employee-profile-service"

interface AnalyticsData {
  totalEmployees: number
  activeEmployees: number
  departmentBreakdown: { name: string; count: number; percentage: number }[]
  employmentTypes: { type: string; count: number; percentage: number }[]
  workLocations: { location: string; count: number; percentage: number }[]
  recentHires: { month: string; count: number }[]
  averageTenure: number
}

export function ProfileAnalyticsView() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch statistics and all profiles to calculate analytics
        const [statisticsData, allProfiles] = await Promise.all([
          employeeProfileService.getEmployeeStatistics(),
          employeeProfileService.getAllEmployeeProfiles(),
        ])

        // Calculate department breakdown
        const departmentCounts = allProfiles.reduce((acc: Record<string, number>, profile: any) => {
          const dept = profile.departmentName || "Unknown"
          acc[dept] = (acc[dept] || 0) + 1
          return acc
        }, {})

        const departmentBreakdown = Object.entries(departmentCounts).map(([name, count]) => ({
          name,
          count: count as number,
          percentage: ((count as number) / allProfiles.length) * 100,
        }))

        // Calculate employment types
        const employmentCounts = allProfiles.reduce((acc: Record<string, number>, profile: any) => {
          const type = profile.employmentType || "Unknown"
          const label =
            type === "FULL_TIME"
              ? "Full Time"
              : type === "PART_TIME"
                ? "Part Time"
                : type === "CONTRACT"
                  ? "Contract"
                  : type
          acc[label] = (acc[label] || 0) + 1
          return acc
        }, {})

        const employmentTypes = Object.entries(employmentCounts).map(([type, count]) => ({
          type,
          count: count as number,
          percentage: ((count as number) / allProfiles.length) * 100,
        }))

        // Calculate work locations
        const locationCounts = allProfiles.reduce((acc: Record<string, number>, profile: any) => {
          const location = profile.workLocation || "Unknown"
          const label =
            location === "OFFICE"
              ? "Office"
              : location === "REMOTE"
                ? "Remote"
                : location === "HYBRID"
                  ? "Hybrid"
                  : location
          acc[label] = (acc[label] || 0) + 1
          return acc
        }, {})

        const workLocations = Object.entries(locationCounts).map(([location, count]) => ({
          location,
          count: count as number,
          percentage: ((count as number) / allProfiles.length) * 100,
        }))

        // Calculate recent hires (mock data for now as we don't have hire date analytics from API)
        const currentDate = new Date()
        const recentHires = Array.from({ length: 6 }, (_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - i), 1)
          return {
            month: date.toLocaleDateString("en-US", { month: "short" }),
            count: Math.floor(Math.random() * 20) + 5, // Mock data
          }
        })

        // Calculate average tenure (mock for now)
        const averageTenure = 2.3

        setAnalytics({
          totalEmployees: statisticsData.totalCount || allProfiles.length,
          activeEmployees: statisticsData.activeCount || allProfiles.filter((p: any) => p.status === "ACTIVE").length,
          departmentBreakdown,
          employmentTypes,
          workLocations,
          recentHires,
          averageTenure,
        })
      } catch (error) {
        console.error("Failed to fetch analytics:", error)
        setError(error instanceof Error ? error.message : "Failed to load analytics")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load analytics</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics not available</h3>
            <p className="text-gray-600">Unable to load analytics data.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">
      {/* Key Metrics */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analytics.totalEmployees}</div>
            <p className="text-xs text-blue-600">Company-wide</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Active Profiles</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analytics.activeEmployees}</div>
            <p className="text-xs text-green-600">
              {Math.round((analytics.activeEmployees / analytics.totalEmployees) * 100)}% active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Departments</CardTitle>
            <Building className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analytics.departmentBreakdown.length}</div>
            <p className="text-xs text-purple-600">Active departments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Avg. Tenure</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{analytics.averageTenure} yrs</div>
            <p className="text-xs text-orange-600">Company average</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Breakdown */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-indigo-600" />
                Department Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.departmentBreakdown.map((dept, index) => (
                  <div key={dept.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full bg-indigo-500"
                        style={{
                          backgroundColor: `hsl(${220 + index * 30}, 70%, 50%)`,
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{dept.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {dept.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employment Types */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                Employment Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.employmentTypes.map((type, index) => (
                  <div key={type.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{type.type}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{type.count}</span>
                        <Badge variant="secondary" className="text-xs">
                          {type.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${type.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Work Locations */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                Work Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.workLocations.map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          location.location === "Hybrid"
                            ? "bg-purple-500"
                            : location.location === "Office"
                              ? "bg-blue-500"
                              : "bg-green-500"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{location.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{location.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {location.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Hires */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Hiring Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentHires.map((hire, index) => (
                  <div key={hire.month} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{hire.month} 2024</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(hire.count / 20) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{hire.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total new hires (6 months)</span>
                  <span className="font-medium text-gray-900">
                    {analytics.recentHires.reduce((sum, hire) => sum + hire.count, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
