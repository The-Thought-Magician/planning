'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, Play, Pause, RotateCcw } from 'lucide-react'
import { TIME_BLOCK_CATEGORIES } from '@/lib/constants'
import { TimeBlockCategory } from '@prisma/client'

// Mock current activity data - this would come from API in real implementation
const mockCurrentActivity = {
  id: '1',
  title: 'Deep Work - DSA Practice',
  category: 'DEEP_WORK_DSA' as TimeBlockCategory,
  startTime: new Date(Date.now() - 45 * 60 * 1000), // Started 45 minutes ago
  endTime: new Date(Date.now() + 135 * 60 * 1000), // Ends in 135 minutes (3 hour block)
  pomodoroCount: 0,
  targetPomodoros: 6,
}

const mockNextActivity = {
  title: 'Lunch Break',
  category: 'MEAL_LUNCH' as TimeBlockCategory,
  startTime: new Date(Date.now() + 135 * 60 * 1000),
  endTime: new Date(Date.now() + 195 * 60 * 1000),
}

export function CurrentActivity() {
  // Avoid SSR/client mismatches for time-based UI by deferring certain renders until after mount
  const [mounted, setMounted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [progress, setProgress] = useState<number>(0)
  const [isPomodoroActive, setIsPomodoroActive] = useState(false)
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60) // 25 minutes in seconds

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const endTime = mockCurrentActivity.endTime
      const startTime = mockCurrentActivity.startTime
      
      const totalDuration = endTime.getTime() - startTime.getTime()
      const elapsed = now.getTime() - startTime.getTime()
      const remaining = endTime.getTime() - now.getTime()
      
      if (remaining > 0) {
        const hours = Math.floor(remaining / (1000 * 60 * 60))
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
        setTimeRemaining(`${hours}h ${minutes}m`)
        setProgress((elapsed / totalDuration) * 100)
      } else {
        setTimeRemaining('Completed')
        setProgress(100)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let pomodoroInterval: NodeJS.Timeout

    if (isPomodoroActive && pomodoroTime > 0) {
      pomodoroInterval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1)
      }, 1000)
    } else if (pomodoroTime === 0) {
      setIsPomodoroActive(false)
      setPomodoroTime(25 * 60) // Reset to 25 minutes
    }

    return () => clearInterval(pomodoroInterval)
  }, [isPomodoroActive, pomodoroTime])

  const formatPomodoroTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentCategoryData = TIME_BLOCK_CATEGORIES[mockCurrentActivity.category]
  const nextCategoryData = TIME_BLOCK_CATEGORIES[mockNextActivity.category]

  const formatLocalTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{currentCategoryData.icon}</span>
            <div>
              <CardTitle className="text-lg">{mockCurrentActivity.title}</CardTitle>
              <CardDescription>
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: `${currentCategoryData.color}10`, color: currentCategoryData.color }}
                >
                  {currentCategoryData.label}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{timeRemaining}</div>
            <div className="text-sm text-muted-foreground">remaining</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Pomodoro Timer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pomodoro Timer</span>
              <Badge variant="outline">
                {mockCurrentActivity.pomodoroCount}/{mockCurrentActivity.targetPomodoros}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-3xl font-mono font-bold text-primary">
                {formatPomodoroTime(pomodoroTime)}
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant={isPomodoroActive ? "destructive" : "default"}
                  onClick={() => setIsPomodoroActive(!isPomodoroActive)}
                >
                  {isPomodoroActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsPomodoroActive(false)
                    setPomodoroTime(25 * 60)
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Next Activity Preview */}
          <div className="space-y-3">
            <span className="text-sm font-medium">Next Activity</span>
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50">
              <span className="text-lg">{nextCategoryData.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{mockNextActivity.title}</div>
                <div className="text-xs text-muted-foreground">
                  {mounted ? formatLocalTime(mockNextActivity.startTime) : '--:--'}
                </div>
              </div>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}