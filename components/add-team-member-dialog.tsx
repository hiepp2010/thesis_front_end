"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, User, Plus, AlertCircle } from "lucide-react"
import { projectService } from "@/lib/api/project-service"
import { toast } from "sonner"

interface AddTeamMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onMemberAdded: () => void
}

export function AddTeamMemberDialog({ open, onOpenChange, projectId, onMemberAdded }: AddTeamMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddMember = async () => {
    if (!email.trim()) {
      setError("Please enter an email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await projectService.addMemberToProjectByEmail(projectId, email.trim())
      toast.success(`Successfully added ${email} to the project`)
      onMemberAdded()
      resetForm()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Failed to add member:", error)
      const errorMessage = error?.message || "Failed to add member. Please check the email address and try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleAddMember()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-600" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Invite a new member to your project by entering their email address. They will be able to view tickets and
            collaborate on the project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <Label htmlFor="member-email" className="flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-blue-600" />
              Email Address
            </Label>
            <Input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError("") // Clear error when user starts typing
              }}
              onKeyPress={handleKeyPress}
              placeholder="john.doe@example.com"
              className="w-full"
              disabled={isLoading}
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Enter the email address of the person you want to add to this project. They must have an existing account.
            </p>
          </div>

          {/* Info card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Member Permissions</h4>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>• View and comment on project tickets</li>
                  <li>• Participate in project discussions</li>
                  <li>• Receive project notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            disabled={!email.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
