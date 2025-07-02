"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Package, Edit, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Asset {
  id: number
  assetTag: string
  name: string
  description: string
  brand: string
  model: string
  serialNumber: string
  category: string
  status: "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED"
  condition: "EXCELLENT" | "GOOD" | "FAIR" | "POOR"
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  location: string
  assignedTo?: string
}

export function AssetInventoryView() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)

      // Mock API call - replace with actual endpoint
      const mockAssets: Asset[] = [
        {
          id: 1,
          assetTag: "AST001",
          name: 'MacBook Pro 16"',
          description: "MacBook Pro 16-inch M3 Max",
          brand: "Apple",
          model: "MBP16-M3-2024",
          serialNumber: "MBP2024001",
          category: "Laptops",
          status: "ASSIGNED",
          condition: "EXCELLENT",
          purchaseDate: "2024-01-15",
          purchasePrice: 3499,
          currentValue: 3200,
          location: "IT Department",
          assignedTo: "John Doe",
        },
        {
          id: 2,
          assetTag: "AST002",
          name: 'Dell Monitor 27"',
          description: 'Dell UltraSharp 27" 4K Monitor',
          brand: "Dell",
          model: "U2723QE",
          serialNumber: "DEL2024002",
          category: "Monitors",
          status: "AVAILABLE",
          condition: "GOOD",
          purchaseDate: "2024-02-20",
          purchasePrice: 599,
          currentValue: 550,
          location: "Storage Room A",
        },
        {
          id: 3,
          assetTag: "AST003",
          name: "iPhone 15 Pro",
          description: "iPhone 15 Pro 256GB",
          brand: "Apple",
          model: "iPhone15Pro-256",
          serialNumber: "IPH2024003",
          category: "Mobile Devices",
          status: "ASSIGNED",
          condition: "EXCELLENT",
          purchaseDate: "2024-03-10",
          purchasePrice: 1199,
          currentValue: 1100,
          location: "IT Department",
          assignedTo: "Jane Smith",
        },
      ]

      setAssets(mockAssets)
    } catch (error) {
      console.error("Error fetching assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || asset.status === statusFilter
    const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
    const matchesCondition = conditionFilter === "all" || asset.condition === conditionFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesCondition
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800"
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800"
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800"
      case "RETIRED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "bg-green-100 text-green-800"
      case "GOOD":
        return "bg-blue-100 text-blue-800"
      case "FAIR":
        return "bg-yellow-100 text-yellow-800"
      case "POOR":
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
          <p className="text-gray-600">Loading asset inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Asset Inventory</h2>
          <p className="text-gray-600">Manage all company assets and equipment</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="RETIRED">Retired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Laptops">Laptops</SelectItem>
              <SelectItem value="Monitors">Monitors</SelectItem>
              <SelectItem value="Mobile Devices">Mobile Devices</SelectItem>
              <SelectItem value="Office Equipment">Office Equipment</SelectItem>
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="EXCELLENT">Excellent</SelectItem>
              <SelectItem value="GOOD">Good</SelectItem>
              <SelectItem value="FAIR">Fair</SelectItem>
              <SelectItem value="POOR">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid gap-4">
        {filteredAssets.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
              <p className="text-gray-600 text-center">
                {searchQuery || statusFilter !== "all" || categoryFilter !== "all" || conditionFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No assets in the inventory yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAssets.map((asset) => (
            <Card key={asset.id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-900">{asset.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Tag: {asset.assetTag}</span>
                      <span>•</span>
                      <span>
                        {asset.brand} {asset.model}
                      </span>
                      <span>•</span>
                      <span>{asset.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">{asset.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getConditionColor(asset.condition)}>{asset.condition}</Badge>
                    <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Serial Number:</span>
                    <p className="font-medium">{asset.serialNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Location:</span>
                    <p className="font-medium">{asset.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Purchase Price:</span>
                    <p className="font-medium">${asset.purchasePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Value:</span>
                    <p className="font-medium">${asset.currentValue.toLocaleString()}</p>
                  </div>
                </div>

                {asset.assignedTo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-blue-800 text-sm">
                      <strong>Assigned to:</strong> {asset.assignedTo}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Purchased: {new Date(asset.purchaseDate).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
