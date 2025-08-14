'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Square, RotateCcw, Settings, Timer } from 'lucide-react'
import { toast } from 'sonner'

interface TimerSettings {
  workTime: number // seconds
  restTime: number // seconds  
  rounds: number
  workoutName: string
}

const HIIT_PRESETS = [
  {
    name: 'Classic HIIT',
    workTime: 30,
    restTime: 30,
    rounds: 8,
    description: '30s work, 30s rest - 8 rounds'
  },
  {
    name: 'Tabata',
    workTime: 20,
    restTime: 10,
    rounds: 8,
    description: '20s work, 10s rest - 8 rounds'
  },
  {
    name: 'Power Intervals',
    workTime: 45,
    restTime: 15,
    rounds: 6,
    description: '45s work, 15s rest - 6 rounds'
  },
  {
    name: 'Endurance',
    workTime: 60,
    restTime: 30,
    rounds: 10,
    description: '60s work, 30s rest - 10 rounds'
  }
]

const HIIT_EXERCISES = [
  'High Knees',
  'Burpees',
  'Jump Squats',
  'Mountain Climbers',
  'Sprint Intervals',
  'Jumping Jacks',
  'Plank Jacks',
  'Jump Lunges',
  'Russian Twists',
  'Push-ups'
]

export function HiitTimer() {
  const [settings, setSettings] = useState<TimerSettings>({
    workTime: 30,
    restTime: 30,
    rounds: 8,
    workoutName: 'Classic HIIT'
  })
  
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentRound, setCurrentRound] = useState(1)
  const [timeLeft, setTimeLeft] = useState(settings.workTime)
  const [isWorkPhase, setIsWorkPhase] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const [currentExercise, setCurrentExercise] = useState('')
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning && !isPaused && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Phase transition
            if (isWorkPhase) {
              // Work phase ending, go to rest
              setIsWorkPhase(false)
              setCurrentExercise('Rest')
              toast.success('Rest time!')
              return settings.restTime
            } else {
              // Rest phase ending
              if (currentRound >= settings.rounds) {
                // Workout finished
                setIsFinished(true)
                setIsRunning(false)
                toast.success('HIIT workout completed!')
                return 0
              } else {
                // Next round
                setCurrentRound(prev => prev + 1)
                setIsWorkPhase(true)
                setCurrentExercise(getRandomExercise())
                toast.success(`Round ${currentRound + 1} - ${getRandomExercise()}`)
                return settings.workTime
              }
            }
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, isWorkPhase, currentRound, settings, isFinished])

  const getRandomExercise = () => {
    return HIIT_EXERCISES[Math.floor(Math.random() * HIIT_EXERCISES.length)]
  }

  const startTimer = () => {
    if (!isRunning) {
      setCurrentRound(1)
      setTimeLeft(settings.workTime)
      setIsWorkPhase(true)
      setIsFinished(false)
      setCurrentExercise(getRandomExercise())
    }
    setIsRunning(true)
    setIsPaused(false)
    toast.success('HIIT timer started!')
  }

  const pauseTimer = () => {
    setIsPaused(true)
    toast.info('Timer paused')
  }

  const resumeTimer = () => {
    setIsPaused(false)
    toast.success('Timer resumed')
  }

  const stopTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setCurrentRound(1)
    setTimeLeft(settings.workTime)
    setIsWorkPhase(true)
    setIsFinished(false)
    setCurrentExercise('')
    toast.info('Timer stopped')
  }

  const resetTimer = () => {
    stopTimer()
    toast.success('Timer reset')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalWorkoutTime = () => {
    return (settings.workTime + settings.restTime) * settings.rounds
  }

  const getElapsedTime = () => {
    const completedRounds = currentRound - 1
    const currentRoundTime = isWorkPhase ? 
      (settings.workTime - timeLeft) : 
      (settings.workTime + (settings.restTime - timeLeft))
    
    return (completedRounds * (settings.workTime + settings.restTime)) + currentRoundTime
  }

  const getProgress = () => {
    return (getElapsedTime() / getTotalWorkoutTime()) * 100
  }

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            {settings.workoutName}
          </CardTitle>
          <CardDescription>
            Round {currentRound} of {settings.rounds}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phase Indicator */}
          <div className="flex justify-center">
            <Badge 
              variant={isWorkPhase ? "default" : "secondary"} 
              className={`text-lg px-4 py-2 ${isWorkPhase ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
            >
              {isWorkPhase ? 'WORK' : 'REST'}
            </Badge>
          </div>

          {/* Current Exercise */}
          {currentExercise && (
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">{currentExercise}</h3>
            </div>
          )}

          {/* Main Timer */}
          <div className="space-y-4">
            <div className={`text-8xl font-bold ${isWorkPhase ? 'text-red-500' : 'text-green-500'} transition-colors`}>
              {formatTime(timeLeft)}
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={isWorkPhase ? 
                  ((settings.workTime - timeLeft) / settings.workTime) * 100 :
                  ((settings.restTime - timeLeft) / settings.restTime) * 100
                } 
                className="h-3"
              />
              <p className="text-sm text-muted-foreground">
                {isWorkPhase ? 'Work Phase' : 'Rest Phase'} Progress
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <Progress value={getProgress()} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Overall Progress: {Math.round(getProgress())}%
            </p>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-2">
            {!isRunning ? (
              <Button onClick={startTimer} size="lg">
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : isPaused ? (
              <>
                <Button onClick={resumeTimer} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </Button>
                <Button onClick={stopTimer} variant="outline" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            ) : (
              <>
                <Button onClick={pauseTimer} variant="outline" size="lg">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
                <Button onClick={stopTimer} variant="destructive" size="lg">
                  <Square className="h-5 w-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
            <Button onClick={resetTimer} variant="ghost" size="lg">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Workout Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentRound}</div>
              <p className="text-sm text-muted-foreground">Current Round</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(getTotalWorkoutTime())}</div>
              <p className="text-sm text-muted-foreground">Total Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatTime(getElapsedTime())}</div>
              <p className="text-sm text-muted-foreground">Elapsed</p>
            </div>
          </div>

          {/* Completion Message */}
          {isFinished && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6 text-center">
                <div className="text-green-600 text-2xl font-bold mb-2">
                  Workout Complete! 🎉
                </div>
                <p className="text-green-700">
                  Great job! You completed {settings.rounds} rounds in {formatTime(getTotalWorkoutTime())}.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Timer Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            HIIT Presets
          </CardTitle>
          <CardDescription>
            Choose from popular HIIT workout formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HIIT_PRESETS.map((preset, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  settings.workoutName === preset.name ? 'bg-muted border-primary' : ''
                }`}
                onClick={() => {
                  if (!isRunning) {
                    setSettings({
                      workTime: preset.workTime,
                      restTime: preset.restTime,
                      rounds: preset.rounds,
                      workoutName: preset.name
                    })
                    setTimeLeft(preset.workTime)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground">{preset.description}</p>
                    <div className="text-xs text-muted-foreground">
                      Total: {formatTime((preset.workTime + preset.restTime) * preset.rounds)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card>
        <CardHeader>
          <CardTitle>Exercise Pool</CardTitle>
          <CardDescription>
            Exercises that will be randomly selected during work phases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {HIIT_EXERCISES.map((exercise, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className={`justify-center py-1 ${currentExercise === exercise ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {exercise}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}