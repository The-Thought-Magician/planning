'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Sunrise, Moon, Target, Timer } from 'lucide-react'
import { toast } from 'sonner'

interface MobilityExercise {
  id: string
  name: string
  duration: number // seconds
  description: string
  targetAreas: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  videoUrl?: string
}

interface MobilityRoutine {
  id: string
  name: string
  type: 'morning' | 'evening' | 'pre-workout' | 'post-workout'
  duration: number // total minutes
  exercises: MobilityExercise[]
  description: string
}

interface SessionProgress {
  routineId: string
  completedExercises: string[]
  sessionNotes: string
  startTime?: Date
  endTime?: Date
}

const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: 'morning-flow',
    name: 'Morning Mobility Flow',
    type: 'morning',
    duration: 15,
    description: 'Wake up your body and prepare for the day',
    exercises: [
      {
        id: 'cat-cow',
        name: 'Cat-Cow Stretch',
        duration: 60,
        description: 'Gentle spinal mobility to wake up your back',
        targetAreas: ['spine', 'core'],
        difficulty: 'beginner'
      },
      {
        id: 'hip-circles',
        name: 'Hip Circles',
        duration: 45,
        description: 'Loosen up hip joints with controlled circles',
        targetAreas: ['hips', 'glutes'],
        difficulty: 'beginner'
      },
      {
        id: 'shoulder-rolls',
        name: 'Shoulder Rolls & Arm Circles',
        duration: 60,
        description: 'Activate shoulders and upper back',
        targetAreas: ['shoulders', 'upper back'],
        difficulty: 'beginner'
      },
      {
        id: 'leg-swings',
        name: 'Dynamic Leg Swings',
        duration: 90,
        description: 'Warm up hips and hamstrings dynamically',
        targetAreas: ['hips', 'hamstrings', 'glutes'],
        difficulty: 'beginner'
      },
      {
        id: 'world-greatest-stretch',
        name: 'World\'s Greatest Stretch',
        duration: 120,
        description: 'Full body dynamic stretch sequence',
        targetAreas: ['hips', 'thoracic spine', 'ankles'],
        difficulty: 'intermediate'
      },
      {
        id: 'inchworm',
        name: 'Inchworm Walkouts',
        duration: 90,
        description: 'Dynamic full body activation',
        targetAreas: ['hamstrings', 'shoulders', 'core'],
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'evening-recovery',
    name: 'Evening Recovery',
    type: 'evening',
    duration: 20,
    description: 'Relax and unwind for better sleep quality',
    exercises: [
      {
        id: 'child-pose',
        name: 'Child\'s Pose',
        duration: 90,
        description: 'Gentle back and hip stretch to calm the nervous system',
        targetAreas: ['lower back', 'hips', 'shoulders'],
        difficulty: 'beginner'
      },
      {
        id: 'pigeon-pose',
        name: 'Pigeon Pose',
        duration: 180,
        description: 'Deep hip flexor and glute stretch (90s each side)',
        targetAreas: ['hip flexors', 'glutes', 'IT band'],
        difficulty: 'intermediate'
      },
      {
        id: 'spinal-twist',
        name: 'Supine Spinal Twist',
        duration: 120,
        description: 'Gentle spinal rotation to release tension (60s each side)',
        targetAreas: ['spine', 'glutes', 'IT band'],
        difficulty: 'beginner'
      },
      {
        id: 'legs-up-wall',
        name: 'Legs Up the Wall',
        duration: 300,
        description: 'Restorative pose to improve circulation and calm mind',
        targetAreas: ['hamstrings', 'lower back', 'nervous system'],
        difficulty: 'beginner'
      },
      {
        id: 'happy-baby',
        name: 'Happy Baby Pose',
        duration: 90,
        description: 'Gentle hip and lower back stretch',
        targetAreas: ['hips', 'lower back', 'inner thighs'],
        difficulty: 'beginner'
      },
      {
        id: 'savasana',
        name: 'Savasana (Corpse Pose)',
        duration: 240,
        description: 'Complete relaxation and integration',
        targetAreas: ['full body', 'nervous system'],
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'pre-workout',
    name: 'Pre-Workout Activation',
    type: 'pre-workout',
    duration: 10,
    description: 'Prepare your body for training',
    exercises: [
      {
        id: 'arm-circles',
        name: 'Arm Circles',
        duration: 30,
        description: 'Warm up shoulders and arms',
        targetAreas: ['shoulders'],
        difficulty: 'beginner'
      },
      {
        id: 'leg-swings-front',
        name: 'Forward/Back Leg Swings',
        duration: 60,
        description: 'Dynamic hip flexor and hamstring activation',
        targetAreas: ['hip flexors', 'hamstrings'],
        difficulty: 'beginner'
      },
      {
        id: 'leg-swings-side',
        name: 'Side-to-Side Leg Swings',
        duration: 60,
        description: 'Dynamic adductor and abductor activation',
        targetAreas: ['adductors', 'abductors'],
        difficulty: 'beginner'
      },
      {
        id: 'bodyweight-squats',
        name: 'Bodyweight Squats',
        duration: 60,
        description: 'Activate glutes and warm up movement patterns',
        targetAreas: ['glutes', 'quads', 'ankles'],
        difficulty: 'beginner'
      },
      {
        id: 'band-pull-aparts',
        name: 'Band Pull-Aparts',
        duration: 45,
        description: 'Activate rear delts and upper back',
        targetAreas: ['rear delts', 'rhomboids'],
        difficulty: 'beginner'
      },
      {
        id: 'scapular-wall-slides',
        name: 'Scapular Wall Slides',
        duration: 45,
        description: 'Activate and mobilize shoulder blades',
        targetAreas: ['scapula', 'shoulders'],
        difficulty: 'beginner'
      }
    ]
  }
]

export function MobilityChecklist() {
  const [selectedRoutine, setSelectedRoutine] = useState<MobilityRoutine | null>(null)
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState(0)
  const [exerciseRunning, setExerciseRunning] = useState(false)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (exerciseRunning && exerciseTimeLeft > 0) {
      interval = setInterval(() => {
        setExerciseTimeLeft(prev => {
          if (prev <= 1) {
            setExerciseRunning(false)
            toast.success('Exercise complete! Move to next exercise.')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [exerciseRunning, exerciseTimeLeft])

  const startRoutine = (routine: MobilityRoutine) => {
    setSelectedRoutine(routine)
    setSessionProgress({
      routineId: routine.id,
      completedExercises: [],
      sessionNotes: '',
      startTime: new Date()
    })
    setSessionActive(true)
    setCurrentExerciseIndex(0)
    toast.success(`Started ${routine.name}`)
  }

  const startExerciseTimer = (exercise: MobilityExercise) => {
    setExerciseTimeLeft(exercise.duration)
    setExerciseRunning(true)
    toast.info(`Starting ${exercise.name} - ${exercise.duration}s`)
  }

  const completeExercise = (exerciseId: string) => {
    if (!sessionProgress) {return}
    
    const updatedProgress = {
      ...sessionProgress,
      completedExercises: [...sessionProgress.completedExercises, exerciseId]
    }
    setSessionProgress(updatedProgress)
    
    // Move to next exercise
    if (selectedRoutine && currentExerciseIndex < selectedRoutine.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1)
    }
    
    toast.success('Exercise completed!')
  }

  const finishSession = () => {
    if (!sessionProgress) {return}
    
    const updatedProgress = {
      ...sessionProgress,
      endTime: new Date()
    }
    setSessionProgress(updatedProgress)
    
    const completionRate = (updatedProgress.completedExercises.length / (selectedRoutine?.exercises.length || 1)) * 100
    toast.success(`Session completed! ${completionRate.toFixed(0)}% completion rate`)
    
    // Reset state
    setSessionActive(false)
    setSelectedRoutine(null)
    setCurrentExerciseIndex(0)
    setExerciseRunning(false)
    setExerciseTimeLeft(0)
  }

  const getCompletionPercentage = () => {
    if (!sessionProgress || !selectedRoutine) {return 0}
    return (sessionProgress.completedExercises.length / selectedRoutine.exercises.length) * 100
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'morning': return <Sunrise className="h-4 w-4" />
      case 'evening': return <Moon className="h-4 w-4" />
      case 'pre-workout': return <Target className="h-4 w-4" />
      case 'post-workout': return <CheckCircle className="h-4 w-4" />
      default: return <Timer className="h-4 w-4" />
    }
  }

  if (sessionActive && selectedRoutine) {
    const currentExercise = selectedRoutine.exercises[currentExerciseIndex]
    
    return (
      <div className="space-y-6">
        {/* Session Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getTypeIcon(selectedRoutine.type)}
                  {selectedRoutine.name}
                </CardTitle>
                <CardDescription>
                  Exercise {currentExerciseIndex + 1} of {selectedRoutine.exercises.length}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {Math.round(getCompletionPercentage())}% Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={getCompletionPercentage()} className="h-2" />
          </CardContent>
        </Card>

        {/* Current Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
            <CardDescription>{currentExercise.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {exerciseRunning ? formatTime(exerciseTimeLeft) : formatTime(currentExercise.duration)}
                </div>
                <p className="text-sm text-muted-foreground">Duration</p>
              </div>
              
              <div className="text-center">
                <Badge className={getDifficultyColor(currentExercise.difficulty)}>
                  {currentExercise.difficulty}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">Difficulty</p>
              </div>
              
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {currentExercise.targetAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Target Areas</p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              {!exerciseRunning ? (
                <Button onClick={() => startExerciseTimer(currentExercise)}>
                  <Timer className="h-4 w-4 mr-2" />
                  Start Timer
                </Button>
              ) : (
                <Button 
                  onClick={() => setExerciseRunning(false)}
                  variant="outline"
                >
                  <Timer className="h-4 w-4 mr-2" />
                  Pause Timer
                </Button>
              )}
              
              <Button
                onClick={() => completeExercise(currentExercise.id)}
                variant="default"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </div>

            {exerciseTimeLeft > 0 && (
              <Progress 
                value={((currentExercise.duration - exerciseTimeLeft) / currentExercise.duration) * 100} 
                className="h-2"
              />
            )}
          </CardContent>
        </Card>

        {/* Exercise List */}
        <Card>
          <CardHeader>
            <CardTitle>Routine Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedRoutine.exercises.map((exercise, index) => (
                <div 
                  key={exercise.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    index === currentExerciseIndex ? 'bg-primary/10 border-primary' :
                    sessionProgress?.completedExercises.includes(exercise.id) ? 'bg-green-50 border-green-200' :
                    'bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={sessionProgress?.completedExercises.includes(exercise.id) || false}
                      disabled
                    />
                    <div>
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(exercise.duration)}</p>
                    </div>
                  </div>
                  {index === currentExerciseIndex && (
                    <Badge>Current</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session Controls */}
        <Card>
          <CardContent className="flex justify-between items-center p-6">
            <div>
              <p className="font-medium">Session Progress</p>
              <p className="text-sm text-muted-foreground">
                {sessionProgress?.completedExercises.length} of {selectedRoutine.exercises.length} completed
              </p>
            </div>
            <Button onClick={finishSession}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finish Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Routine Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Mobility Routine
          </CardTitle>
          <CardDescription>
            Select a routine based on your current needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOBILITY_ROUTINES.map((routine) => (
              <Card key={routine.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getTypeIcon(routine.type)}
                      {routine.name}
                    </CardTitle>
                    <Badge variant="outline">
                      {routine.duration}min
                    </Badge>
                  </div>
                  <CardDescription>{routine.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {routine.exercises.length} exercises
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {routine.exercises.slice(0, 3).map((exercise, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {exercise.name}
                        </Badge>
                      ))}
                      {routine.exercises.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{routine.exercises.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => startRoutine(routine)}
                    >
                      Start Routine
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

  {/* Today&apos;s Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Mobility Focus</CardTitle>
          <CardDescription>
            Recommended based on your schedule and workout plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sunrise className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Morning (Recommended)</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Start your day with 15 minutes of mobility work to wake up your body
              </p>
              <Button size="sm" onClick={() => startRoutine(MOBILITY_ROUTINES[0])}>
                Start Morning Flow
              </Button>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="h-4 w-4 text-blue-500" />
                <h4 className="font-medium">Evening (Recovery)</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Wind down with gentle stretches to improve sleep quality
              </p>
              <Button size="sm" variant="outline" onClick={() => startRoutine(MOBILITY_ROUTINES[1])}>
                Start Evening Flow
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}