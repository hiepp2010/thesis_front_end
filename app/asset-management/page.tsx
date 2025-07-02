"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Package, FileText, Users, BarChart3 } from "lucide-react"
import { AssetStatsCards } from "@/components/asset-stats-cards"
import { CreateAssetRequestDialog } from "@/components/create-asset-request-dialog"
import { MyAssetRequests } from "@/components/my-asset-requests"
import { MyAssetAssignments } from "@/components/my-asset-assignments"
import { AssetInventoryView } from "@/components/asset-inventory-view"
import { TeamAssetsView } from "@/components/team-assets-view"
import { AssetReportsView } from "@/components/asset-reports-view"
import { useAuth } from "@/components/auth-provider"

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

interface AssetRequest {
  id: number
  employeeId: number
  employeeName: string
  assetCategoryName: string
  description: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  status: "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED"
  requestDate: string
  approvedBy?: number
  approvedByName?: string
  approvalNotes?: string
}

interface AssetAssignment {
  id: number
  assetId: number
  assetName: string
  assetTag: string
  assignedDate: string
  status: "ASSIGNED" | "RETURNED"
  conditionAtAssignment: string
  conditionAtReturn?: string
  returnDate?: string
}

export default function AssetManagementPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [stats, setStats] = useState<AssetStats | null>(null)
  const [myRequests, setMyRequests] = useState<AssetRequest[]>([])
  const [myAssignments, setMyAssignments] = useState<AssetAssignment[]>([])
  const [loading, setLoading] = useState(true)

  const isHR = user?.roles?.includes("HR") || false
  const isManager = user?.roles?.includes("MANAGER") || false

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Mock API calls - replace with actual API endpoints
      const mockStats: AssetStats = {
        totalAssets: 245,
        availableAssets: 67,
        assignedAssets: 178,
        pendingRequests: 12,
        urgentRequests: 3,
        myActiveRequests: 2,
        myAssignments: 4,
        totalValue: 125000,
      }

      const mockRequests: AssetRequest[] = [
        {
          id: 1,
          employeeId: 25,
          employeeName: user?.username || "Current User",
          assetCategoryName: "Laptops",
          description: "MacBook Pro 16-inch for development work",
          priority: "HIGH",
          status: "PENDING",
          requestDate: "2025-07-01",
        },
        {
          id: 2,
          employeeId: 25,
          employeeName: user?.username || "Current User",
          assetCategoryName: "Office Equipment",
          description: "Standing desk for ergonomic workspace",
          priority: "MEDIUM",
          status: "APPROVED",
          requestDate: "2025-06-28",
          approvedBy: 32,
          approvedByName: "HR Manager",
          approvalNotes: "Approved for productivity enhancement",
        },
      ]

      const mockAssignments: AssetAssignment[] = [
        {
          id: 1,
          assetId: 101,
          assetName: "Dell Laptop XPS 13",
          assetTag: "AST001",
          assignedDate: "2025-06-15",
          status: "ASSIGNED",
          conditionAtAssignment: "Good",
        },
        {
          id: 2,
          assetId: 205,
          assetName: "iPhone 14 Pro",
          assetTag: "PHN045",
          assignedDate: "2025-06-20",
          status: "ASSIGNED",
          conditionAtAssignment: "Excellent",
        },
      ]

      setStats(mockStats)
      setMyRequests(mockRequests)
      setMyAssignments(mockAssignments)
    } catch (error) {
      console.error("Error fetching asset data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async (requestData: any) => {
    try {
      // Mock API call - replace with actual endpoint
      console.log("Creating asset request:", requestData)

      const newRequest: AssetRequest = {
        id: Date.now(),
        employeeId: 25,
        employeeName: user?.username || "Current User",
        assetCategoryName: requestData.category,
        description: requestData.description,
        priority: requestData.priority,
        status: "PENDING",
        requestDate: new Date().toISOString().split("T")[0],
      }

      setMyRequests((prev) => [newRequest, ...prev])
      setShowCreateDialog(false)
    } catch (error) {
      console.error("Error creating asset request:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-600 font-medium">Loading asset management...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-600 mt-1">Manage IT assets, equipment, and requests</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Request Asset
          </Button>
        </div>

        {/* Stats Cards */}
        <AssetStatsCards stats={stats} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="my-requests" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              My Requests
            </TabsTrigger>
            <TabsTrigger value="my-assets" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              My Assets
            </TabsTrigger>
            {(isManager || isHR) && (
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            )}
            {(isManager || isHR) && (
              <TabsTrigger value="team" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Assets
              </TabsTrigger>
            )}
            {isHR && (
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Requests */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
                <div className="space-y-3">
                  {myRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{request.description}</p>
                        <p className="text-sm text-gray-600">{request.assetCategoryName}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : request.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Assets */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Assets</h3>
                <div className="space-y-3">
                  {myAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{assignment.assetName}</p>
                        <p className="text-sm text-gray-600">Tag: {assignment.assetTag}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Since {assignment.assignedDate}</p>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-requests">
            <MyAssetRequests requests={myRequests} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="my-assets">
            <MyAssetAssignments assignments={myAssignments} onRefresh={fetchData} />
          </TabsContent>

          {(isManager || isHR) && (
            <TabsContent value="inventory">
              <AssetInventoryView />
            </TabsContent>
          )}

          {(isManager || isHR) && (
            <TabsContent value="team">
              <TeamAssetsView />
            </TabsContent>
          )}

          {isHR && (
            <TabsContent value="reports">
              <AssetReportsView />
            </TabsContent>
          )}
        </Tabs>

        {/* Create Asset Request Dialog */}
        <CreateAssetRequestDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateRequest}
        />
      </div>
    </div>
  )
}
