"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Download, BarChart3, TrendingUp, Package, DollarSign } from "lucide-react"
import { format } from "date-fns"

interface AssetReport {
  totalAssets: number
  totalValue: number
  availableAssets: number
  assignedAssets: number
  maintenanceAssets: number
  retiredAssets: number
  departmentBreakdown: DepartmentAssets[]
  categoryBreakdown: CategoryAssets[]
  conditionBreakdown: ConditionAssets[]
  monthlyTrends: MonthlyTrend[]
}

interface DepartmentAssets {
  department: string
  assetCount: number
  totalValue: number
  averageValue: number
}

interface CategoryAssets {
  category: string
  assetCount: number
  totalValue: number
  percentage: number
}

interface ConditionAssets {
  condition: string
  assetCount: number
  percentage: number
}

interface MonthlyTrend {
  month: string
  newAssets: number
  retiredAssets: number
  totalValue: number
}

export function AssetReportsView() {
  const [report, setReport] = useState<AssetReport | null>(null)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [reportType, setReportType] = useState("overview")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)

      // Mock API call - replace with actual endpoint
      const mockReport: AssetReport = {
        totalAssets: 245,
        totalValue: 487500,
        availableAssets: 67,
        assignedAssets: 178,
        maintenanceAssets: 8,
        retiredAssets: 12,
        departmentBreakdown: [
          { department: "Engineering", assetCount: 89, totalValue: 245000, averageValue: 2753 },
          { department: "Marketing", assetCount: 34, totalValue: 78500, averageValue: 2309 },
          { department: "Sales", assetCount: 45, totalValue: 89000, averageValue: 1978 },
          { department: "HR", assetCount: 23, totalValue: 45000, averageValue: 1957 },
          { department: "Finance", assetCount: 18, totalValue: 30000, averageValue: 1667 },
        ],
        categoryBreakdown: [
          { category: "Laptops", assetCount: 98, totalValue: 285000, percentage: 40 },
          { category: "Mobile Devices", assetCount: 67, totalValue: 89500, percentage: 27 },
          { category: "Monitors", assetCount: 45, totalValue: 67500, percentage: 18 },
          { category: "Office Equipment", assetCount: 23, totalValue: 34500, percentage: 9 },
          { category: "Other", assetCount: 12, totalValue: 10000, percentage: 5 },
        ],
        conditionBreakdown: [
          { condition: "Excellent", assetCount: 89, percentage: 36 },
          { condition: "Good", assetCount: 123, percentage: 50 },
          { condition: "Fair", assetCount: 28, percentage: 11 },
          { condition: "Poor", assetCount: 5, percentage: 2 },
        ],
        monthlyTrends: [
          { month: "Jan 2024", newAssets: 15, retiredAssets: 3, totalValue: 45000 },
          { month: "Feb 2024", newAssets: 22, retiredAssets: 5, totalValue: 67000 },
          { month: "Mar 2024", newAssets: 18, retiredAssets: 2, totalValue: 52000 },
          { month: "Apr 2024", newAssets: 25, retiredAssets: 4, totalValue: 78000 },
          { month: "May 2024", newAssets: 19, retiredAssets: 6, totalValue: 58000 },
          { month: "Jun 2024", newAssets: 21, retiredAssets: 3, totalValue: 63000 },
        ],
      }

      setReport(mockReport)
    } catch (error) {
      console.error("Error fetching report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    // Mock export functionality
    console.log("Exporting report:", { reportType, startDate, endDate })
    // In real implementation, this would generate and download a report file
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading asset reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive asset management insights and statistics</p>
        </div>
        <Button onClick={handleExportReport} className="bg-teal-600 hover:bg-teal-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Report Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Overview Report</SelectItem>
            <SelectItem value="department">Department Analysis</SelectItem>
            <SelectItem value="category">Category Breakdown</SelectItem>
            <SelectItem value="condition">Condition Report</SelectItem>
            <SelectItem value="trends">Monthly Trends</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-800">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">{report?.totalAssets}</div>
            <p className="text-xs text-teal-600 mt-1">Company-wide inventory</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${report?.totalValue.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">Asset portfolio value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Available</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{report?.availableAssets}</div>
            <p className="text-xs text-blue-600 mt-1">Ready for assignment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Assigned</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{report?.assignedAssets}</div>
            <p className="text-xs text-purple-600 mt-1">Currently in use</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Assets by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report?.departmentBreakdown.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{dept.department}</h4>
                  <p className="text-sm text-gray-600">{dept.assetCount} assets</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${dept.totalValue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Avg: ${dept.averageValue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Assets by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report?.categoryBreakdown.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{category.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{category.assetCount} assets</span>
                    <Badge variant="outline">{category.percentage}%</Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">Value: ${category.totalValue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Condition Report */}
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Asset Condition Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {report?.conditionBreakdown.map((condition) => (
              <div key={condition.condition} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-1">{condition.assetCount}</div>
                <div className="text-sm font-medium text-gray-700 mb-2">{condition.condition}</div>
                <Badge
                  className={
                    condition.condition === "Excellent"
                      ? "bg-green-100 text-green-800"
                      : condition.condition === "Good"
                        ? "bg-blue-100 text-blue-800"
                        : condition.condition === "Fair"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                  }
                >
                  {condition.percentage}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
