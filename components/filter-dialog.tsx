"use client"

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
import { getAllTags, useTaskStore } from "@/lib/data"

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function FilterDialog({ isOpen, onClose }: FilterDialogProps) {
  const {
    users,
    priorityFilter,
    tagFilter,
    assigneeFilter,
    setPriorityFilter,
    setTagFilter,
    setAssigneeFilter,
    clearFilters,
  } = useTaskStore()

  const allTags = getAllTags()

  const handleApplyFilters = () => {
    onClose()
  }

  const handleClearFilters = () => {
    clearFilters()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
          <DialogDescription>Apply filters to narrow down the tasks displayed on the board.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="priority-filter">Priority</Label>
            <Select
              value={priorityFilter}
              onValueChange={(value: "low" | "medium" | "high" | "all") => setPriorityFilter(value)}
            >
              <SelectTrigger id="priority-filter">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tag-filter">Tag</Label>
            <Select value={tagFilter} onValueChange={(value: string) => setTagFilter(value)}>
              <SelectTrigger id="tag-filter">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="assignee-filter">Assignee</Label>
            <Select value={assigneeFilter} onValueChange={(value: string) => setAssigneeFilter(value)}>
              <SelectTrigger id="assignee-filter">
                <SelectValue placeholder="Filter by assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
