'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus, Target, Calculator, History, AlertCircle } from 'lucide-react'
import { useExercises, useWorkouts, useUpdateExercise } from '@/hooks/use-dashboard'
import type { WorkoutExercise, WorkoutSession } from '@/types/api'
// import { toast } from 'sonner'

interface ExerciseProgress {
  id: string
  name: string
  currentWeight: number
  previousWeight: number
  targetReps: number
  lastReps: number
  sessions: number
  trend: 'increasing' | 'plateau' | 'decreasing'
  nextSuggestion: {
    weight: number
    reps: number
    reasoning: string
  }
  lastSession?: Date
}

const MAIN_EXERCISES = [
  'Barbell Bench Press',
  'Back Squats', 
  'Deadlifts',
  'Overhead Press',
  'Barbell Rows',
  'Pull-ups'
]

// Helper function to process workout data into exercise progress
function processExerciseData(exercises: WorkoutExercise[], _workouts: WorkoutSession[]): ExerciseProgress[] {
  const exerciseMap = new Map<string, ExerciseProgress>()

  // Group exercises by name and calculate progress
  exercises.forEach(exercise => {
    if (!exercise.sets || exercise.sets.length === 0) { return }

    const exerciseName = exercise.exerciseName
    if (!exerciseMap.has(exerciseName)) {
      // Initialize with default values
      exerciseMap.set(exerciseName, {
        id: exercise.id,
        name: exerciseName,
        currentWeight: 0,
        previousWeight: 0,
        targetReps: 8,
        lastReps: 0,
        sessions: 0,
        trend: 'plateau',
        nextSuggestion: {
          weight: 0,
          reps: 8,
          reasoning: 'No recent data available'
        },
        lastSession: exercise.session?.date ? new Date(exercise.session.date) : undefined
      })
    }

    const progress = exerciseMap.get(exerciseName)!
    
    // Get the heaviest set from this exercise
    const heaviestSet = exercise.sets
      .filter(set => set.completed && set.weight > 0)
      .sort((a, b) => b.weight - a.weight)[0]

    if (heaviestSet) {
      progress.sessions++
      progress.previousWeight = progress.currentWeight
      progress.currentWeight = heaviestSet.weight
      progress.lastReps = heaviestSet.reps
      progress.targetReps = Math.max(progress.targetReps, heaviestSet.reps)
      
      if (exercise.session?.date) {
        const sessionDate = new Date(exercise.session.date)
        if (!progress.lastSession || sessionDate > progress.lastSession) {
          progress.lastSession = sessionDate
        }
      }
    }
  })

  // Calculate trends and suggestions
  exerciseMap.forEach(progress => {
    if (progress.sessions > 1) {
      if (progress.currentWeight > progress.previousWeight) {
        progress.trend = 'increasing'
        progress.nextSuggestion = calculateProgression(progress, 'increase')
      } else if (progress.currentWeight < progress.previousWeight) {
        progress.trend = 'decreasing'
        progress.nextSuggestion = calculateProgression(progress, 'decrease')
      } else {
        progress.trend = 'plateau'
        progress.nextSuggestion = calculateProgression(progress, 'plateau')
      }
    } else {
      progress.nextSuggestion = calculateProgression(progress, 'initial')
    }
  })

  return Array.from(exerciseMap.values())
    .sort((a, b) => (b.lastSession?.getTime() || 0) - (a.lastSession?.getTime() || 0))
}

function calculateProgression(progress: ExerciseProgress, context: 'increase' | 'decrease' | 'plateau' | 'initial') {
  const baseWeight = progress.currentWeight || 50
  const targetReps = progress.targetReps || 8
  
  switch (context) {
    case 'increase':
      const increment = baseWeight > 50 ? 2.5 : 1.25
      return {
        weight: progress.currentWeight + increment,
        reps: targetReps,
        reasoning: `Great progress! Increase weight by ${increment}kg and maintain ${targetReps} reps.`
      }
    
    case 'decrease':
      return {
        weight: Math.max(progress.currentWeight * 0.9, baseWeight * 0.8),
        reps: targetReps,
        reasoning: 'Focus on form and gradually build back up to previous weight.'
      }
    
    case 'plateau':
      if (progress.lastReps < targetReps - 2) {
        return {
          weight: progress.currentWeight * 0.95,
          reps: targetReps,
          reasoning: 'Consider a slight deload to break through the plateau.'
        }
      } else {
        return {
          weight: progress.currentWeight,
          reps: targetReps,
          reasoning: 'Maintain current weight and focus on perfect form.'
        }
      }
    
    default:
      return {
        weight: baseWeight,
        reps: targetReps,
        reasoning: 'Start with a manageable weight and build up gradually.'
      }
  }
}

export function ProgressiveOverload() {
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [currentWeight, setCurrentWeight] = useState<number>(0)
  const [targetReps, setTargetReps] = useState<number>(8)
  const [achievedReps, setAchievedReps] = useState<number>(8)

  const {
    data: exercisesResponse,
    isLoading: exercisesLoading,
    error: exercisesError,
  } = useExercises()

  const {
    data: workoutsResponse,
    isLoading: workoutsLoading,
    error: workoutsError,
  } = useWorkouts()

  const _updateExerciseMutation = useUpdateExercise()

  const isLoading = exercisesLoading || workoutsLoading
  const error = exercisesError || workoutsError

  if (isLoading) {
    return <ProgressiveOverloadSkeleton />
  }

  if (error) {
    return <ProgressiveOverloadError error={error.message} />
  }

  const exercises = (exercisesResponse?.success ? exercisesResponse.data : []) as WorkoutExercise[]
  const workouts = (workoutsResponse?.success ? workoutsResponse.data : []) as WorkoutSession[]
  
  const exerciseProgress = processExerciseData(exercises, workouts)

  const calculateManualProgression = () => {
    if (!selectedExercise || !currentWeight || !targetReps || !achievedReps) {
      return null
    }

    const repsAchieved = achievedReps >= targetReps
    const repsExceeded = achievedReps > targetReps + 1

    let suggestion = {
      weight: currentWeight,
      reps: targetReps,
      reasoning: 'Maintain current parameters'
    }

    if (repsExceeded) {
      // Increase weight
      const increment = currentWeight > 50 ? 2.5 : 1.25
      suggestion = {
        weight: currentWeight + increment,
        reps: targetReps,
        reasoning: `You exceeded target reps (${achievedReps}/${targetReps}). Increase weight by ${increment}kg.`
      }
    } else if (!repsAchieved) {
      // Consider deload or maintain
      if (achievedReps < targetReps - 2) {
        suggestion = {
          weight: currentWeight * 0.9,
          reps: targetReps,
          reasoning: `You fell short significantly (${achievedReps}/${targetReps}). Consider a 10% deload.`
        }
      } else {
        suggestion = {
          weight: currentWeight,
          reps: targetReps,
          reasoning: `Close to target (${achievedReps}/${targetReps}). Maintain weight and focus on form.`
        }
      }
    }

    return suggestion
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  const _getTrendBadgeColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-500'
      case 'decreasing':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const calculation = calculateManualProgression()

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Increasing</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {exerciseProgress.filter(e => e.trend === 'increasing').length}
                </div>
                <p className="text-xs text-muted-foreground">exercises progressing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plateau</CardTitle>
                <Minus className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {exerciseProgress.filter(e => e.trend === 'plateau').length}
                </div>
                <p className="text-xs text-muted-foreground">exercises stalled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Decreasing</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {exerciseProgress.filter(e => e.trend === 'decreasing').length}
                </div>
                <p className="text-xs text-muted-foreground">exercises declining</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {exerciseProgress.reduce((sum, e) => sum + e.sessions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">logged sessions</p>
              </CardContent>
            </Card>
          </div>

          {/* Exercise Progress Cards */}
          <div className="space-y-4">
            {exerciseProgress.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Exercise Data Found</h3>
                  <p className="text-muted-foreground">
                    Start logging your workouts to track progressive overload
                  </p>
                </CardContent>
              </Card>
            ) : (
              exerciseProgress.map((exercise, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{exercise.name}</CardTitle>
                        <CardDescription>
                          {exercise.sessions} sessions tracked
                          {exercise.lastSession && (
                            <span className="ml-2">
                              • Last: {exercise.lastSession.toLocaleDateString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(exercise.trend)}
                        <Badge variant="outline" className={getTrendColor(exercise.trend)}>
                          {exercise.trend}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Current Status</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Weight:</span>
                            <span className="font-medium">{exercise.currentWeight}kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Reps:</span>
                            <span className="font-medium">{exercise.lastReps}/{exercise.targetReps}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Progress</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Weight Change:</span>
                            <span className={`font-medium ${
                              exercise.currentWeight > exercise.previousWeight ? 'text-green-600' : 
                              exercise.currentWeight < exercise.previousWeight ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              {exercise.currentWeight > exercise.previousWeight ? '+' : ''}
                              {(exercise.currentWeight - exercise.previousWeight).toFixed(1)}kg
                            </span>
                          </div>
                          <Progress 
                            value={(exercise.lastReps / exercise.targetReps) * 100} 
                            className="h-2" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Next Session</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Weight:</span>
                            <span className="font-medium">{exercise.nextSuggestion.weight}kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Target:</span>
                            <span className="font-medium">{exercise.nextSuggestion.reps} reps</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Suggestion:</strong> {exercise.nextSuggestion.reasoning}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Progressive Overload Calculator
              </CardTitle>
              <CardDescription>
                Input your last session data to get progression recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise</Label>
                  <select
                    id="exercise"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                  >
                    <option value="">Select an exercise</option>
                    {MAIN_EXERCISES.map(exercise => (
                      <option key={exercise} value={exercise}>{exercise}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                  <Input
                    id="currentWeight"
                    type="number"
                    step="0.5"
                    value={currentWeight || ''}
                    onChange={(e) => setCurrentWeight(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetReps">Target Reps</Label>
                  <Input
                    id="targetReps"
                    type="number"
                    value={targetReps || ''}
                    onChange={(e) => setTargetReps(parseInt(e.target.value) || 8)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievedReps">Achieved Reps</Label>
                  <Input
                    id="achievedReps"
                    type="number"
                    value={achievedReps || ''}
                    onChange={(e) => setAchievedReps(parseInt(e.target.value) || 8)}
                  />
                </div>
              </div>

              {calculation && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Next Session</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Weight:</span>
                            <span className="font-medium">{calculation.weight}kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Target Reps:</span>
                            <span className="font-medium">{calculation.reps}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          {calculation.reasoning}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Exercise History
              </CardTitle>
              <CardDescription>
                Your workout history and progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workouts.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Exercise history will be displayed here once you start logging workouts
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {workouts.slice(0, 10).map((workout) => (
                    <div key={workout.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{workout.type}</h4>
                        <Badge variant={workout.completed ? "default" : "secondary"}>
                          {workout.completed ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Date: {new Date(workout.date).toLocaleDateString()}</div>
                        <div>Exercises: {workout.exercises?.length || 0}</div>
                        {workout.duration && <div>Duration: {workout.duration} minutes</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Loading skeleton component
function ProgressiveOverloadSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex space-x-1">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Error component
function ProgressiveOverloadError({ error }: { error: string }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>Error Loading Exercise Data</span>
        </CardTitle>
        <CardDescription>
          Unable to load your exercise progress data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground mb-4">
            {error}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}