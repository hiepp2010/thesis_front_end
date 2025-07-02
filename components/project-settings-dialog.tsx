"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project } from "@/lib/data"

interface ProjectSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
  project: Project
  onSave: (updatedProject: Project) => void
}

export function ProjectSettingsDialog({ isOpen, onClose, project, onSave }: ProjectSettingsDialogProps) {
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [status, setStatus] = useState<"planning" | "in-progress" | "completed">(project.status)
  const [dueDate, setDueDate] = useState(project.dueDate || "")

  const handleSave = () => {
    onSave({
      ...project,
      name,
      description,
      status,
      dueDate: dueDate || null,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>Update project details and configuration.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: "planning" | "in-progress" | "completed") => setStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="members">Team Members</Label>
            <div className="flex flex-wrap gap-2 border p-2 rounded-md min-h-[100px]">
              {/* This would be a multi-select component in a real app */}
              <div className="bg-slate-100 px-2 py-1 rounded-md text-sm">John Doe</div>
              <div className="bg-slate-100 px-2 py-1 rounded-md text-sm">Alex Johnson</div>
              <div className="bg-slate-100 px-2 py-1 rounded-md text-sm">Sarah Williams</div>
              <Button variant="outline" size="sm" className="h-7">
                + Add Member
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
