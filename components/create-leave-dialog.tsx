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
import { Calendar, Sun, AlertTriangle, Info } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface CreateLeaveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface LeaveTypes {
  [key: string]: string
}

export function CreateLeaveDialog({ open, onOpenChange, onSuccess }: CreateLeaveDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypes>({})
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
    isEmergency: false,
  })
  const [calculatedDays, setCalculatedDays] = useState(0)

  useEffect(() => {
    if (open) {
      fetchLeaveTypes()
      // Set default start date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFormData((prev) => ({
        ...prev,
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: tomorrow.toISOString().split("T")[0],
      }))
    }
  }, [open])

  useEffect(() => {
    calculateDays()
  }, [formData.startDate, formData.endDate])

  const fetchLeaveTypes = async () => {
    try {
      const response = await apiClient.get("/hrms/time-off/leave-types")
      setLeaveTypes(response.leaveTypes || {})
    } catch (error) {
      console.error("Error fetching leave types:", error)
    }
  }

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)

      if (end >= start) {
        // Calculate working days (excluding weekends)
        let days = 0
        const current = new Date(start)

        while (current <= end) {
          const dayOfWeek = current.getDay()
          // Count Monday (1) to Friday (5) as working days
          if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            days++
          }
          current.setDate(current.getDate() + 1)
        }

        setCalculatedDays(days)
      } else {
        setCalculatedDays(0)
      }
    } else {
      setCalculatedDays(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const requestData = {
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveType: formData.leaveType,
        reason: formData.reason,
        isEmergency: formData.isEmergency,
      }

      await apiClient.post("/hrms/time-off/request", requestData)

      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      })

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit leave request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      startDate: "",
      endDate: "",
      leaveType: "",
      reason: "",
      isEmergency: false,
    })
    setCalculatedDays(0)
  }

  const isFormValid = () => {
    return (
      formData.startDate &&
      formData.endDate &&
      formData.leaveType &&
      formData.reason &&
      new Date(formData.endDate) >= new Date(formData.startDate)
    )
  }

  const isDateInPast = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-green-600" />
            Submit Leave Request
          </DialogTitle>
          <DialogDescription>
            Fill out the details for your time off request. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                min={formData.isEmergency ? undefined : new Date().toISOString().split("T")[0]}
                required
              />
              {!formData.isEmergency && isDateInPast(formData.startDate) && (
                <p className="text-sm text-red-600">Start date cannot be in the past (unless emergency)</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {/* Calculated Days Display */}
          {calculatedDays > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Working Days: {calculatedDays}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {calculatedDays === 1 ? "1 working day" : `${calculatedDays} working days`}
                  </div>
                </div>
                {calculatedDays > 10 && (
                  <div className="flex items-center gap-2 mt-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Extended leave period - manager approval required</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leave Type */}
          <div className="space-y-2">
            <Label htmlFor="leaveType">Leave Type *</Label>
            <Select
              value={formData.leaveType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, leaveType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(leaveTypes).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a detailed explanation for your leave request..."
              rows={3}
              required
            />
          </div>

          {/* Emergency Request */}
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <Label htmlFor="isEmergency" className="font-medium">
                  Mark as Emergency
                </Label>
                <p className="text-sm text-gray-600">Emergency requests may override normal restrictions</p>
              </div>
            </div>
            <Switch
              id="isEmergency"
              checked={formData.isEmergency}
              onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isEmergency: checked }))}
            />
          </div>

          {formData.isEmergency && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium mb-1">Emergency Leave Guidelines:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Only mark as emergency for urgent, unforeseen circumstances</li>
                      <li>Emergency requests can be submitted for past dates</li>
                      <li>Provide detailed justification in the reason field</li>
                      <li>Emergency requests will notify managers immediately</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leave Balance Warning */}
          {calculatedDays > 5 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">Extended Leave Notice:</p>
                    <p>
                      You're requesting {calculatedDays} working days of leave. Please ensure you have sufficient leave
                      balance and have arranged proper handover of responsibilities.
                    </p>
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
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
