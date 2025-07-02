"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Calendar, ArrowLeft, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface MyAssetAssignmentsProps {
  assignments: AssetAssignment[]
  onRefresh: () => void
}

export function MyAssetAssignments({ assignments, onRefresh }: MyAssetAssignmentsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showReturnDialog, setShowReturnDialog] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<AssetAssignment | null>(null)
  const [returnData, setReturnData] = useState({
    condition: "",
    notes: "",
    issues: "",
  })

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.assetTag.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeAssignments = filteredAssignments.filter((a) => a.status === "ASSIGNED")
  const returnedAssignments = filteredAssignments.filter((a) => a.status === "RETURNED")

  const handleReturnAsset = async () => {
    if (!selectedAsset) return

    try {
      // Mock API call - replace with actual endpoint
      console.log("Returning asset:", selectedAsset.id, returnData)

      // Update the assignment status locally
      const updatedAssignments = assignments.map((assignment) =>
        assignment.id === selectedAsset.id
          ? {
              ...assignment,
              status: "RETURNED" as const,
              conditionAtReturn: returnData.condition,
              returnDate: new Date().toISOString().split("T")[0],
            }
          : assignment,
      )

      setShowReturnDialog(false)
      setSelectedAsset(null)
      setReturnData({ condition: "", notes: "", issues: "" })
      onRefresh()
    } catch (error) {
      console.error("Error returning asset:", error)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Asset Assignments</h2>
          <p className="text-gray-600">Manage your assigned assets and equipment</p>
        </div>
        <Button onClick={onRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Active Assignments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Assignments ({activeAssignments.length})</h3>

        {activeAssignments.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active assignments</h3>
              <p className="text-gray-600 text-center">You don't have any assets currently assigned to you</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeAssignments.map((assignment) => (
              <Card key={assignment.id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-gray-900">{assignment.assetName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Tag: {assignment.assetTag}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Assigned: {new Date(assignment.assignedDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getConditionColor(assignment.conditionAtAssignment)}>
                        {assignment.conditionAtAssignment}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">{assignment.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">Assignment ID: #{assignment.id}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAsset(assignment)
                          setShowReturnDialog(true)
                        }}
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Return Asset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Returned Assignments */}
      {returnedAssignments.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Returned Assets ({returnedAssignments.length})</h3>

          <div className="grid gap-4">
            {returnedAssignments.map((assignment) => (
              <Card key={assignment.id} className="bg-gray-50/70 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold text-gray-700">{assignment.assetName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Tag: {assignment.assetTag}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Returned:{" "}
                          {assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assignment.conditionAtReturn && (
                        <Badge className={getConditionColor(assignment.conditionAtReturn)}>
                          {assignment.conditionAtReturn}
                        </Badge>
                      )}
                      <Badge className="bg-gray-100 text-gray-800">{assignment.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Return Asset Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
          </DialogHeader>

          {selectedAsset && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedAsset.assetName}</h4>
                <p className="text-sm text-gray-600">Tag: {selectedAsset.assetTag}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Asset Condition *</Label>
                <Select
                  value={returnData.condition}
                  onValueChange={(value) => setReturnData((prev) => ({ ...prev, condition: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Damaged">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Return Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about the asset condition..."
                  value={returnData.notes}
                  onChange={(e) => setReturnData((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issues">Issues or Damage</Label>
                <Textarea
                  id="issues"
                  placeholder="Report any issues, damage, or missing accessories..."
                  value={returnData.issues}
                  onChange={(e) => setReturnData((prev) => ({ ...prev, issues: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleReturnAsset}
                  disabled={!returnData.condition}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Return Asset
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
