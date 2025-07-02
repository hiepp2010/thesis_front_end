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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTaskStore } from "@/lib/data"

interface LinkTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  currentTaskId: string
  onLinkTask: (linkedTask: { id: string; title: string; relationship: string }) => void
}

export function LinkTaskDialog({ isOpen, onClose, currentTaskId, onLinkTask }: LinkTaskDialogProps) {
  const { tasks } = useTaskStore()
  const [selectedTaskId, setSelectedTaskId] = useState("")
  const [relationship, setRelationship] = useState("Related task")

  // Filter out the current task and already linked tasks
  const availableTasks = tasks.filter((task) => task.id !== currentTaskId)

  const handleSubmit = () => {
    if (selectedTaskId) {
      const selectedTask = tasks.find((task) => task.id === selectedTaskId)
      if (selectedTask) {
        onLinkTask({
          id: selectedTaskId,
          title: selectedTask.title,
          relationship,
        })
        resetForm()
        onClose()
      }
    }
  }

  const resetForm = () => {
    setSelectedTaskId("")
    setRelationship("Related task")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) resetForm()
        onClose()
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Link Task</DialogTitle>
          <DialogDescription>Connect this task to another task in your project.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task">Task</Label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger id="task">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {availableTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger id="relationship">
                <SelectValue placeholder="Select relationship type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Related task">Related task</SelectItem>
                <SelectItem value="Blocked by">Blocked by</SelectItem>
                <SelectItem value="Blocks">Blocks</SelectItem>
                <SelectItem value="Duplicates">Duplicates</SelectItem>
                <SelectItem value="Is duplicated by">Is duplicated by</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedTaskId}>
            Link Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
