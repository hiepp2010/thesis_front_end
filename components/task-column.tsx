"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import type { Task } from "@/lib/definitions"

interface TaskColumnProps {
  title: string
  status: string
  tasks: Task[]
  onAddTask: (status: string) => void
  onTaskClick: (taskId: string) => void
}

export function TaskColumn({ title, status, tasks, onAddTask, onTaskClick }: TaskColumnProps) {
  // Get column header color
  const getHeaderColor = () => {
    switch (status) {
      case "todo":
        return "text-gray-700"
      case "in-progress":
        return "text-blue-600"
      case "review":
        return "text-amber-600"
      case "done":
        return "text-emerald-600"
      default:
        return "text-gray-700"
    }
  }

  // Get column badge color
  const getBadgeColor = () => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-700"
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "review":
        return "bg-amber-100 text-amber-700"
      case "done":
        return "bg-emerald-100 text-emerald-700"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  return (
    <div className="flex flex-col p-4">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold ${getHeaderColor()}`}>{title}</h3>
          <span className={`${getBadgeColor()} text-xs px-2 py-1 rounded-full font-medium`}>{tasks.length}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full"
          onClick={() => onAddTask(status)}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Tasks */}
      <div className="space-y-3 min-h-[200px] overflow-y-auto max-h-[calc(100vh-240px)] pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 border-2 border-dashed rounded-lg border-gray-200 bg-white/50 backdrop-blur-sm">
            <p className="text-sm text-gray-500">No tasks</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} />)
        )}

        {/* Add Task Button */}
        <Button
          variant="ghost"
          className="w-full justify-center text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-200 hover:border-gray-300 h-10 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-200"
          onClick={() => onAddTask(status)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  )
}
