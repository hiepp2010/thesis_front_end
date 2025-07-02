"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Package, Eye, UserCheck } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TeamMember {
  id: number
  name: string
  email: string
  department: string
  role: string
  assignedAssets: TeamAsset[]
  totalAssetValue: number
}

interface TeamAsset {
  id: number
  assetTag: string
  name: string
  category: string
  assignedDate: string
  condition: string
  value: number
}

export function TeamAssetsView() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamAssets()
  }, [])

  const fetchTeamAssets = async () => {
    try {
      setLoading(true)

      // Mock API call - replace with actual endpoint
      const mockTeamMembers: TeamMember[] = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@company.com",
          department: "Engineering",
          role: "Senior Developer",
          totalAssetValue: 4699,
          assignedAssets: [
            {
              id: 1,
              assetTag: "AST001",
              name: 'MacBook Pro 16"',
              category: "Laptops",
              assignedDate: "2024-01-15",
              condition: "Excellent",
              value: 3499,
            },
            {
              id: 2,
              assetTag: "MON001",
              name: 'Dell Monitor 27"',
              category: "Monitors",
              assignedDate: "2024-01-15",
              condition: "Good",
              value: 599,
            },
            {
              id: 3,
              assetTag: "KEY001",
              name: "Mechanical Keyboard",
              category: "Peripherals",
              assignedDate: "2024-01-20",
              condition: "Good",
              value: 199,
            },
          ],
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane.smith@company.com",
          department: "Marketing",
          role: "Marketing Manager",
          totalAssetValue: 2299,
          assignedAssets: [
            {
              id: 4,
              assetTag: "IPH001",
              name: "iPhone 15 Pro",
              category: "Mobile Devices",
              assignedDate: "2024-02-10",
              condition: "Excellent",
              value: 1199,
            },
            {
              id: 5,
              assetTag: "LAP002",
              name: 'MacBook Air 13"',
              category: "Laptops",
              assignedDate: "2024-02-10",
              condition: "Good",
              value: 1100,
            },
          ],
        },
        {
          id: 3,
          name: "Mike Johnson",
          email: "mike.johnson@company.com",
          department: "Sales",
          role: "Sales Representative",
          totalAssetValue: 1799,
          assignedAssets: [
            {
              id: 6,
              assetTag: "LAP003",
              name: "Dell Laptop",
              category: "Laptops",
              assignedDate: "2024-03-01",
              condition: "Good",
              value: 899,
            },
            {
              id: 7,
              assetTag: "TAB001",
              name: "iPad Pro",
              category: "Tablets",
              assignedDate: "2024-03-01",
              condition: "Excellent",
              value: 900,
            },
          ],
        },
      ]

      setTeamMembers(mockTeamMembers)
    } catch (error) {
      console.error("Error fetching team assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter

    return matchesSearch && matchesDepartment
  })

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team assets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Assets</h2>
          <p className="text-gray-600">View and manage team member asset assignments</p>
        </div>
        <Button onClick={fetchTeamAssets} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="HR">Human Resources</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Team Members List */}
      <div className="grid gap-6">
        {filteredTeamMembers.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600 text-center">
                {searchQuery || departmentFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No team members with asset assignments"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTeamMembers.map((member) => (
            <Card key={member.id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-teal-600" />
                      {member.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{member.email}</span>
                      <span>•</span>
                      <span>{member.role}</span>
                      <span>•</span>
                      <span>{member.department}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${member.totalAssetValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {member.assignedAssets.length} asset{member.assignedAssets.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {member.assignedAssets.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No assets assigned</div>
                ) : (
                  <div className="space-y-3">
                    {member.assignedAssets.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{asset.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Tag: {asset.assetTag}</span>
                              <span>•</span>
                              <span>{asset.category}</span>
                              <span>•</span>
                              <span>Since {new Date(asset.assignedDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-medium text-gray-900">${asset.value.toLocaleString()}</div>
                            <Badge className={getConditionColor(asset.condition)}>{asset.condition}</Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
