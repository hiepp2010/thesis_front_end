"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Calendar, AlertTriangle, DollarSign, Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface CreateOvertimeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface OvertimeTypes {
  [key: string]: string
}

export function CreateOvertimeDialog({ open, onOpenChange, onSuccess }: CreateOvertimeDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [overtimeTypes, setOvertimeTypes] = useState<OvertimeTypes>({})
  const [useTimeRange, setUseTimeRange] = useState(true)
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    hoursRequested: "",
    overtimeType: "",
    reason: "",
    projectName: "",
    isUrgent: false,
  })
  const [calculatedHours, setCalculatedHours] = useState(0)
  const [estimatedCost, setEstimatedCost] = useState(0)

  useEffect(() => {
    if (open) {
      fetchOvertimeTypes()
      // Set default date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFormData((prev) => ({
        ...prev,
        date: tomorrow.toISOString().split("T")[0],
      }))
    }
  }, [open])

  useEffect(() => {
    calculateHours()
  }, [formData.startTime, formData.endTime, formData.hoursRequested, useTimeRange])

  const fetchOvertimeTypes = async () => {
    try {
      const response = await apiClient.get("/hrms/overtime/overtime-types")
      setOvertimeTypes(response.overtimeTypes || {})
    } catch (error) {
      console.error("Error fetching overtime types:", error)
    }
  }

  const calculateHours = () => {
    let hours = 0

    if (useTimeRange && formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}:00`)
      const end = new Date(`2000-01-01T${formData.endTime}:00`)

      if (end > start) {
        hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }
    } else if (!useTimeRange && formData.hoursRequested) {
      hours = Number.parseFloat(formData.hoursRequested) || 0
    }

    setCalculatedHours(hours)
    setEstimatedCost(hours * 25) // Assuming $25/hour base rate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const requestData: any = {
        date: formData.date,
        overtimeType: formData.overtimeType,
        reason: formData.reason,
        projectName: formData.projectName,
        isUrgent: formData.isUrgent,
      }

      if (useTimeRange) {
        requestData.startTime = formData.startTime
        requestData.endTime = formData.endTime
      } else {
        requestData.hoursRequested = Number.parseFloat(formData.hoursRequested)
      }

      await apiClient.post("/hrms/overtime/request", requestData)

      toast({
        title: "Success",
        description: "Overtime request submitted successfully",
      })

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit overtime request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date: "",
      startTime: "",
      endTime: "",
      hoursRequested: "",
      overtimeType: "",
      reason: "",
      projectName: "",
      isUrgent: false,
    })
    setUseTimeRange(true)
    setCalculatedHours(0)
    setEstimatedCost(0)
  }

  const isFormValid = () => {
    const baseValid = formData.date && formData.overtimeType && formData.reason
    const timeValid = useTimeRange
      ? formData.startTime && formData.endTime
      : formData.hoursRequested && Number.parseFloat(formData.hoursRequested) > 0

    return baseValid && timeValid
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Submit Overtime Request
          </DialogTitle>
          <DialogDescription>
            Fill out the details for your overtime request. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Overtime Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          {/* Time Input Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Time Input Method</Label>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${!useTimeRange ? "text-gray-500" : "text-gray-900"}`}>Time Range</span>
                <Switch checked={!useTimeRange} onCheckedChange={(checked) => setUseTimeRange(!checked)} />
                <span className={`text-sm ${useTimeRange ? "text-gray-500" : "text-gray-900"}`}>Hours Only</span>
              </div>
            </div>

            {useTimeRange ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="hoursRequested">Hours Requested *</Label>
                <Input
                  id="hoursRequested"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={formData.hoursRequested}
                  onChange={(e) => setFormData((prev) => ({ ...prev, hoursRequested: e.target.value }))}
                  placeholder="e.g., 4.5"
                  required
                />
              </div>
            )}
          </div>

          {/* Calculated Hours Display */}
          {calculatedHours > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Calculated Hours: {calculatedHours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Estimated Cost: ${estimatedCost}</span>
                  </div>
                </div>
                {calculatedHours > 8 && (
                  <div className="flex items-center gap-2 mt-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Long overtime period - manager approval required</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Overtime Type */}
          <div className="space-y-2">
            <Label htmlFor="overtimeType">Overtime Type *</Label>
            <Select
              value={formData.overtimeType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, overtimeType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select overtime type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(overtimeTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project/Task Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project/Task Name</Label>
            <Input
              id="projectName"
              value={formData.projectName}
              onChange={(e) => setFormData((prev) => ({ ...prev, projectName: e.target.value }))}
              placeholder="e.g., Mobile App Release, System Maintenance"
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Overtime *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a detailed explanation for the overtime request..."
              rows={3}
              required
            />
          </div>

          {/* Urgent Request */}
          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <Label htmlFor="isUrgent" className="font-medium">
                  Mark as Urgent
                </Label>
                <p className="text-sm text-gray-600">Urgent requests are prioritized for approval</p>
              </div>
            </div>
            <Switch
              id="isUrgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isUrgent: checked }))}
            />
          </div>

          {formData.isUrgent && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Urgent Request Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Only mark as urgent if immediate approval is needed</li>
                      <li>Provide clear business justification in the reason field</li>
                      <li>Urgent requests will notify managers immediately</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
