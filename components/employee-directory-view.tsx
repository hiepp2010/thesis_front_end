"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Search, Users, Mail, Building, MapPin, Grid3X3, List } from "lucide-react"
import { employeeProfileService } from "@/lib/api/employee-profile-service"

interface PublicEmployee {
  authUserId: number
  employeeId: string
  name: string
  email: string
  departmentName?: string
  jobPositionTitle?: string
  employmentType: string
  workLocation: string
  status: string
  profilePictureUrl?: string
}

export function EmployeeDirectoryView() {
  const [employees, setEmployees] = useState<PublicEmployee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<PublicEmployee[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const employeeData = await employeeProfileService.getPublicDirectory()
        setEmployees(employeeData)
        setFilteredEmployees(employeeData)
      } catch (error) {
        console.error("Failed to fetch employees:", error)
        setError(error instanceof Error ? error.message : "Failed to load employee directory")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  // Filter employees based on search and department
  useEffect(() => {
    let filtered = employees

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.departmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.jobPositionTitle?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by department
    if (selectedDepartment !== "all") {
      filtered = filtered.filter((employee) => employee.departmentName === selectedDepartment)
    }

    setFilteredEmployees(filtered)
  }, [searchQuery, selectedDepartment, employees])

  const departments = ["all", ...Array.from(new Set(employees.map((emp) => emp.departmentName).filter(Boolean)))]

  const getWorkLocationColor = (location: string) => {
    switch (location) {
      case "OFFICE":
        return "bg-blue-50 text-blue-700"
      case "REMOTE":
        return "bg-green-50 text-green-700"
      case "HYBRID":
        return "bg-purple-50 text-purple-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getWorkLocationLabel = (location: string) => {
    switch (location) {
      case "OFFICE":
        return "Office"
      case "REMOTE":
        return "Remote"
      case "HYBRID":
        return "Hybrid"
      default:
        return location
    }
  }

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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="w-full max-w-md h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="w-40 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-20 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load directory</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search employees..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {/* Employee Grid/List */}
      {viewMode === "grid" ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredEmployees.map((employee) => (
            <motion.div key={employee.authUserId} variants={item}>
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-12 w-12 ring-2 ring-gray-100">
                      <AvatarImage src={employee.profilePictureUrl || "/placeholder.svg"} alt={employee.name} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                        {employee.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{employee.jobPositionTitle}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">{employee.email}</span>
                    </div>

                    {employee.departmentName && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{employee.departmentName}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={getWorkLocationColor(employee.workLocation)}>
                        <MapPin className="h-3 w-3 mr-1" />
                        {getWorkLocationLabel(employee.workLocation)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {employee.employeeId}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <motion.tr
                    key={employee.authUserId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={employee.profilePictureUrl || "/placeholder.svg"} alt={employee.name} />
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                            {employee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.jobPositionTitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.departmentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="secondary" className={getWorkLocationColor(employee.workLocation)}>
                        {getWorkLocationLabel(employee.workLocation)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.employeeId}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedDepartment !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No employees are currently available in the directory."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
