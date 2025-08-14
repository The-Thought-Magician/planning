'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Minus, Target, Calculator, History } from 'lucide-react'

interface ExerciseProgress {
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
}

const MAIN_EXERCISES = [
  'Barbell Bench Press',
  'Back Squats', 
  'Deadlifts',
  'Overhead Press',
  'Barbell Rows',
  'Pull-ups'
]

export function ProgressiveOverload() {
  const [exercises, setExercises] = useState<ExerciseProgress[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [currentWeight, setCurrentWeight] = useState<number>(0)
  const [targetReps, setTargetReps] = useState<number>(8)
  const [achievedReps, setAchievedReps] = useState<number>(8)

  useEffect(() => {
    // Simulate loading exercise data
    const mockData: ExerciseProgress[] = [
      {
        name: 'Barbell Bench Press',
        currentWeight: 80,
        previousWeight: 77.5,
        targetReps: 8,
        lastReps: 9,
        sessions: 12,
        trend: 'increasing',
        nextSuggestion: {
          weight: 82.5,
          reps: 8,
          reasoning: 'You achieved 9 reps last session, increase weight by 2.5kg'
        }
      },
      {
        name: 'Back Squats',
        currentWeight: 100,
        previousWeight: 100,
        targetReps: 8,
        lastReps: 7,
        sessions: 3,
        trend: 'plateau',
        nextSuggestion: {
          weight: 100,
          reps: 8,
          reasoning: 'Stay at current weight until you can complete all reps'
        }
      },
      {
        name: 'Deadlifts',
        currentWeight: 120,
        previousWeight: 125,
        targetReps: 6,
        lastReps: 5,
        sessions: 2,
        trend: 'decreasing',
        nextSuggestion: {
          weight: 115,
          reps: 6,
          reasoning: 'Reduce weight by 5kg to maintain form and build back up'
        }
      },
      {
        name: 'Overhead Press',
        currentWeight: 55,
        previousWeight: 52.5,
        targetReps: 10,
        lastReps: 12,
        sessions: 8,
        trend: 'increasing',
        nextSuggestion: {
          weight: 57.5,
          reps: 10,
          reasoning: 'Consistent progress, increase by 2.5kg'
        }
      }
    ]
    setExercises(mockData)
  }, [])

  const calculateProgression = () => {
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
        return 'bg-green-500'
      case 'decreasing':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const calculation = calculateProgression()

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
                  {exercises.filter(e => e.trend === 'increasing').length}
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
                  {exercises.filter(e => e.trend === 'plateau').length}
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
                  {exercises.filter(e => e.trend === 'decreasing').length}
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
                  {exercises.reduce((sum, e) => sum + e.sessions, 0)}
                </div>
                <p className="text-xs text-muted-foreground">logged sessions</p>
              </CardContent>
            </Card>
          </div>

          {/* Exercise Progress Cards */}
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                      <CardDescription>{exercise.sessions} sessions tracked</CardDescription>
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
            ))}
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
                Track your progress over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Exercise history will be displayed here once you start logging workouts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}