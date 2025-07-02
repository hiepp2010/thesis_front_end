"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface CreateAssetRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function CreateAssetRequestDialog({ open, onOpenChange, onSubmit }: CreateAssetRequestDialogProps) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    justification: "",
    priority: "MEDIUM",
    requiredDate: undefined as Date | undefined,
    specifications: "",
    estimatedCost: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const assetCategories = [
    "Laptops",
    "Desktop Computers",
    "Mobile Devices",
    "Monitors",
    "Office Equipment",
    "Software Licenses",
    "Networking Equipment",
    "Printers",
    "Audio/Video Equipment",
    "Other",
  ]

  const priorities = [
    { value: "LOW", label: "Low", color: "text-gray-600" },
    { value: "MEDIUM", label: "Medium", color: "text-blue-600" },
    { value: "HIGH", label: "High", color: "text-orange-600" },
    { value: "URGENT", label: "Urgent", color: "text-red-600" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
      setFormData({
        category: "",
        description: "",
        justification: "",
        priority: "MEDIUM",
        requiredDate: undefined,
        specifications: "",
        estimatedCost: "",
      })
    } catch (error) {
      console.error("Error submitting request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Request New Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Asset Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Asset Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {assetCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <span className={priority.color}>{priority.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Asset Description *</Label>
            <Input
              id="description"
              placeholder="e.g., MacBook Pro 16-inch, Standing Desk, iPhone 15"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <Label htmlFor="justification">Business Justification *</Label>
            <Textarea
              id="justification"
              placeholder="Explain why this asset is needed and how it will benefit your work..."
              value={formData.justification}
              onChange={(e) => setFormData((prev) => ({ ...prev, justification: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Required Date */}
            <div className="space-y-2">
              <Label>Required Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.requiredDate ? format(formData.requiredDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.requiredDate}
                    onSelect={(date) => setFormData((prev) => ({ ...prev, requiredDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Cost */}
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (Optional)</Label>
              <Input
                id="estimatedCost"
                placeholder="$0.00"
                value={formData.estimatedCost}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimatedCost: e.target.value }))}
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <Label htmlFor="specifications">Technical Specifications (Optional)</Label>
            <Textarea
              id="specifications"
              placeholder="Any specific requirements, models, configurations, etc..."
              value={formData.specifications}
              onChange={(e) => setFormData((prev) => ({ ...prev, specifications: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.category || !formData.description || !formData.justification}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
