"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pause, Play, RotateCcw } from "lucide-react"

interface TimeTrackingProps {
  taskId: string
  initialEstimate?: number // in minutes
}

export function TimeTracking({ taskId, initialEstimate = 0 }: TimeTrackingProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0) // in seconds
  const [estimate, setEstimate] = useState(initialEstimate)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`
  }

  const toggleTracking = () => {
    setIsTracking(!isTracking)
  }

  const resetTimer = () => {
    setIsTracking(false)
    setElapsedTime(0)
  }

  const handleEstimateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    setEstimate(isNaN(value) ? 0 : value)
  }

  const getProgressPercentage = () => {
    if (estimate <= 0) return 0
    const estimateInSeconds = estimate * 60
    return Math.min(100, (elapsedTime / estimateInSeconds) * 100)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Time Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-3xl font-mono text-center">{formatTime(elapsedTime)}</div>

          {estimate > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-medium">
                  {formatTime(elapsedTime)} / {Math.floor(estimate / 60)}h {estimate % 60}m
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant={isTracking ? "destructive" : "default"} className="flex-1" onClick={toggleTracking}>
              {isTracking ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isTracking ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" size="icon" onClick={resetTimer} disabled={elapsedTime === 0}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimate">Time Estimate (minutes)</Label>
            <Input id="estimate" type="number" min="0" value={estimate} onChange={handleEstimateChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
