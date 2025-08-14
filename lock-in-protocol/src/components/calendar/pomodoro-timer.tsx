'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Target,
  Clock,
  Volume2,
  VolumeX,
  SkipForward
} from 'lucide-react'
import { POMODORO_SETTINGS } from '@/lib/constants'
import { usePomodoroNotifications } from '@/hooks/use-notifications'
import { useCallback } from 'react'

type TimerState = 'idle' | 'work' | 'short-break' | 'long-break'
type TimerStatus = 'stopped' | 'running' | 'paused'

type PomodoroSettings = {
  WORK_DURATION: number
  SHORT_BREAK: number
  LONG_BREAK: number
  LONG_BREAK_INTERVAL: number
}

export function PomodoroTimer() {
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('stopped')
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_SETTINGS.WORK_DURATION * 60) // in seconds
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [settings, setSettings] = useState<PomodoroSettings>({ ...POMODORO_SETTINGS })
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const initialTimeRef = useRef(settings.WORK_DURATION * 60)
  const { scheduleBreakNotification } = usePomodoroNotifications()

  const handleTimerComplete = useCallback(() => {
    setTimerStatus('stopped')
    
    if (isSoundEnabled) {
      // Play completion sound (would implement actual sound here)
      console.log('🔔 Timer completed!')
    }

    if (timerState === 'work') {
      setCompletedPomodoros(prev => prev + 1)
      const newCount = completedPomodoros + 1
      
      if (newCount % settings.LONG_BREAK_INTERVAL === 0) {
        // Long break time
        setTimerState('long-break')
        setTimeRemaining(settings.LONG_BREAK * 60)
        initialTimeRef.current = settings.LONG_BREAK * 60
        // Schedule a notification for the long break starting now
        const now = new Date()
        scheduleBreakNotification?.('long', now)
      } else {
        // Short break time
        setTimerState('short-break')
        setTimeRemaining(settings.SHORT_BREAK * 60)
        initialTimeRef.current = settings.SHORT_BREAK * 60
        const now = new Date()
        scheduleBreakNotification?.('short', now)
      }
    } else {
      // Break is over, back to work
      setTimerState('work')
      setTimeRemaining(settings.WORK_DURATION * 60)
      initialTimeRef.current = settings.WORK_DURATION * 60
    }
  }, [completedPomodoros, isSoundEnabled, scheduleBreakNotification, settings.LONG_BREAK, settings.LONG_BREAK_INTERVAL, settings.SHORT_BREAK, settings.WORK_DURATION, timerState])

  useEffect(() => {
    if (timerStatus === 'running' && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerStatus, timeRemaining, handleTimerComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (timerState === 'idle') {
      setTimerState('work')
      setTimeRemaining(settings.WORK_DURATION * 60)
      initialTimeRef.current = settings.WORK_DURATION * 60
    }
    setTimerStatus('running')
  }

  const handlePause = () => {
    setTimerStatus('paused')
  }

  const handleReset = () => {
    setTimerStatus('stopped')
    setTimerState('idle')
    setTimeRemaining(settings.WORK_DURATION * 60)
    initialTimeRef.current = settings.WORK_DURATION * 60
  }

  const handleSkip = () => {
    handleTimerComplete()
  }

  

  const getTimerStateInfo = () => {
    switch (timerState) {
      case 'work':
        return { 
          title: 'Focus Time', 
          description: 'Deep work session',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: Target 
        }
      case 'short-break':
        return { 
          title: 'Short Break', 
          description: 'Quick rest',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: Coffee 
        }
      case 'long-break':
        return { 
          title: 'Long Break', 
          description: 'Extended rest',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: Coffee 
        }
      default:
        return { 
          title: 'Ready', 
          description: 'Start your focus session',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Clock 
        }
    }
  }

  const stateInfo = getTimerStateInfo()
  const progress = ((initialTimeRef.current - timeRemaining) / initialTimeRef.current) * 100
  const IconComponent = stateInfo.icon

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pomodoro Timer</CardTitle>
            <CardDescription>25-minute focus sessions</CardDescription>
          </div>
          <Badge variant="secondary">
            🍅 {completedPomodoros}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="timer" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="space-y-4">
            {/* Timer State Display */}
            <div className={`p-4 rounded-lg ${stateInfo.bgColor} border`}>
              <div className="flex items-center justify-center space-x-2">
                <IconComponent className={`h-5 w-5 ${stateInfo.color}`} />
                <div className="text-center">
                  <div className={`text-sm font-medium ${stateInfo.color}`}>
                    {stateInfo.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stateInfo.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center space-y-4">
              <div className={`text-6xl font-mono font-bold ${stateInfo.color}`}>
                {formatTime(timeRemaining)}
              </div>
              
              {timerState !== 'idle' && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="text-sm text-muted-foreground">
                    {Math.round(progress)}% complete
                  </div>
                </div>
              )}
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-2">
              {timerStatus === 'stopped' || timerStatus === 'paused' ? (
                <Button onClick={handleStart} className="flex-1">
                  <Play className="h-4 w-4 mr-1" />
                  {timerStatus === 'paused' ? 'Resume' : 'Start'}
                </Button>
              ) : (
                <Button onClick={handlePause} variant="destructive" className="flex-1">
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
              )}
              
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              {timerState !== 'idle' && (
                <Button onClick={handleSkip} variant="outline">
                  <SkipForward className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                onClick={() => setIsSoundEnabled(!isSoundEnabled)} 
                variant="outline"
              >
                {isSoundEnabled ? 
                  <Volume2 className="h-4 w-4" /> : 
                  <VolumeX className="h-4 w-4" />
                }
              </Button>
            </div>

            {/* Session Summary */}
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="p-2 rounded bg-muted/30">
                <div className="font-medium">{completedPomodoros}</div>
                <div className="text-muted-foreground text-xs">Completed</div>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <div className="font-medium">
                  {Math.floor(completedPomodoros / settings.LONG_BREAK_INTERVAL)}
                </div>
                <div className="text-muted-foreground text-xs">Long Breaks</div>
              </div>
              <div className="p-2 rounded bg-muted/30">
                <div className="font-medium">
                  {Math.round((completedPomodoros * settings.WORK_DURATION) / 60 * 10) / 10}h
                </div>
                <div className="text-muted-foreground text-xs">Focus Time</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="work-duration">Work Duration (minutes)</Label>
                <Input
                  id="work-duration"
                  type="number"
                  value={settings.WORK_DURATION}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    WORK_DURATION: parseInt(e.target.value) || 25 
                  }))}
                  min="15"
                  max="60"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short-break">Short Break (minutes)</Label>
                <Input
                  id="short-break"
                  type="number"
                  value={settings.SHORT_BREAK}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    SHORT_BREAK: parseInt(e.target.value) || 5 
                  }))}
                  min="3"
                  max="15"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="long-break">Long Break (minutes)</Label>
                <Input
                  id="long-break"
                  type="number"
                  value={settings.LONG_BREAK}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    LONG_BREAK: parseInt(e.target.value) || 15 
                  }))}
                  min="10"
                  max="30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="long-break-interval">Long Break Interval</Label>
                <Input
                  id="long-break-interval"
                  type="number"
                  value={settings.LONG_BREAK_INTERVAL}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    LONG_BREAK_INTERVAL: parseInt(e.target.value) || 4 
                  }))}
                  min="2"
                  max="8"
                />
              </div>

              <Button 
                onClick={() => setSettings(POMODORO_SETTINGS)} 
                variant="outline" 
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}