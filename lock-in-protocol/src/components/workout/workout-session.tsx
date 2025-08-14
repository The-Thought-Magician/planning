'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Play, Square, Clock, Save } from 'lucide-react'
import { WorkoutType } from '@prisma/client'
import { ExerciseSet, WorkoutExercise } from '@/types/workout'
import { toast } from 'sonner'

const WORKOUT_TEMPLATES = {
  [WorkoutType.UPPER_1_PUSH]: [
    { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: 120 },
    { name: 'Overhead Press', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Dips', sets: 3, reps: '12-15', rest: 90 },
    { name: 'Lateral Raises', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Tricep Dips', sets: 3, reps: '12-15', rest: 60 }
  ],
  [WorkoutType.LOWER_1_QUAD]: [
    { name: 'Back Squats', sets: 4, reps: '8-10', rest: 120 },
    { name: 'Bulgarian Split Squats', sets: 3, reps: '12-15 each', rest: 90 },
    { name: 'Leg Press', sets: 3, reps: '15-20', rest: 90 },
    { name: 'Walking Lunges', sets: 3, reps: '12-15 each', rest: 90 },
    { name: 'Calf Raises', sets: 4, reps: '20-25', rest: 60 },
    { name: 'Leg Extensions', sets: 3, reps: '15-20', rest: 60 }
  ],
  [WorkoutType.UPPER_2_PULL]: [
    { name: 'Pull-ups/Chin-ups', sets: 4, reps: '8-12', rest: 120 },
    { name: 'Barbell Rows', sets: 4, reps: '8-10', rest: 120 },
    { name: 'Lat Pulldowns', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Face Pulls', sets: 3, reps: '15-20', rest: 60 },
    { name: 'Barbell Curls', sets: 3, reps: '10-12', rest: 90 },
    { name: 'Hammer Curls', sets: 3, reps: '12-15', rest: 60 }
  ],
  [WorkoutType.LOWER_2_HAMSTRING_GLUTE]: [
    { name: 'Deadlifts', sets: 4, reps: '6-8', rest: 150 },
    { name: 'Romanian Deadlifts', sets: 3, reps: '10-12', rest: 120 },
    { name: 'Hip Thrusts', sets: 3, reps: '12-15', rest: 90 },
    { name: 'Hamstring Curls', sets: 3, reps: '12-15', rest: 90 },
    { name: 'Good Mornings', sets: 3, reps: '12-15', rest: 90 },
    { name: 'Single Leg RDL', sets: 2, reps: '10-12 each', rest: 60 }
  ]
}

export function WorkoutSession() {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [sessionNotes, setSessionNotes] = useState('')

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionStarted) {
      interval = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionStarted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startWorkout = (workoutType: WorkoutType) => {
    setSelectedWorkout(workoutType)
    const template = WORKOUT_TEMPLATES[workoutType as keyof typeof WORKOUT_TEMPLATES]
    const initialExercises = template.map((exercise, index) => ({
      id: `exercise-${index}`,
      sessionId: 'current-session',
      exerciseName: exercise.name,
      sets: Array(exercise.sets).fill(null).map((_, setIndex) => ({
        reps: 0,
        weight: 0,
        completed: false,
        rpe: undefined
      } as ExerciseSet)),
      completed: false,
      notes: undefined
    }))
    setExercises(initialExercises)
    setSessionStarted(true)
    setSessionTime(0)
    toast.success(`Started ${workoutType.replace('_', ' ')} session!`)
  }

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof ExerciseSet, value: string | number | boolean) => {
    setExercises(prev => prev.map((exercise, eIndex) => {
      if (eIndex === exerciseIndex) {
        const updatedSets = exercise.sets.map((set, sIndex) => {
          if (sIndex === setIndex) {
            return { ...set, [field]: value }
          }
          return set
        })
        return { ...exercise, sets: updatedSets }
      }
      return exercise
    }))
  }

  const addSet = (exerciseIndex: number) => {
    setExercises(prev => prev.map((exercise, eIndex) => {
      if (eIndex === exerciseIndex) {
        const newSet: ExerciseSet = {
          reps: 0,
          weight: 0,
          completed: false,
          rpe: undefined
        }
        return { ...exercise, sets: [...exercise.sets, newSet] }
      }
      return exercise
    }))
  }

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    setExercises(prev => prev.map((exercise, eIndex) => {
      if (eIndex === exerciseIndex) {
        return { ...exercise, sets: exercise.sets.filter((_, sIndex) => sIndex !== setIndex) }
      }
      return exercise
    }))
  }

  const completeExercise = (exerciseIndex: number) => {
    setExercises(prev => prev.map((exercise, eIndex) => {
      if (eIndex === exerciseIndex) {
        return { ...exercise, completed: true }
      }
      return exercise
    }))
    toast.success(`${exercises[exerciseIndex].exerciseName} completed!`)
  }

  const endSession = async () => {
    // Here you would save the workout to your database
    setSessionStarted(false)
    setSelectedWorkout(null)
    setExercises([])
    setSessionTime(0)
    setSessionNotes('')
    toast.success(`Workout completed in ${formatTime(sessionTime)}!`)
  }

  if (!sessionStarted) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Start New Workout Session</CardTitle>
            <CardDescription>
              Choose your workout type to begin training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(WorkoutType)
                .filter(type => !type.includes('HIIT') && !type.includes('MOBILITY'))
                .map(type => (
                <Card key={type} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{type.replace('_', ' ')}</h3>
                      <p className="text-sm text-muted-foreground">
                        {WORKOUT_TEMPLATES[type as keyof typeof WORKOUT_TEMPLATES]?.length || 0} exercises
                      </p>
                      <Button 
                        size="sm" 
                        onClick={() => startWorkout(type)}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {selectedWorkout?.replace('_', ' ')} Session
              </CardTitle>
              <CardDescription>
                Track your sets, reps, and weights
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {formatTime(sessionTime)}
              </div>
              <p className="text-sm text-muted-foreground">Session time</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id} className={exercise.completed ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{exercise.exerciseName}</CardTitle>
                  <CardDescription>
                    {exercise.sets.length} sets • {exercise.completed ? 'Completed' : 'In Progress'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addSet(exerciseIndex)}
                    disabled={exercise.completed}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {!exercise.completed && (
                    <Button
                      size="sm"
                      onClick={() => completeExercise(exerciseIndex)}
                    >
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={set.completed}
                        onCheckedChange={(checked) => 
                          updateSet(exerciseIndex, setIndex, 'completed', checked)
                        }
                        disabled={exercise.completed}
                      />
                      <Label className="text-sm font-medium">Set {setIndex + 1}</Label>
                    </div>
                    
                    <div className="flex gap-2 flex-1">
                      <div className="space-y-1">
                        <Label className="text-xs">Weight (kg)</Label>
                        <Input
                          type="number"
                          value={set.weight || ''}
                          onChange={(e) => 
                            updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)
                          }
                          className="w-20"
                          disabled={exercise.completed}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">Reps</Label>
                        <Input
                          type="number"
                          value={set.reps || ''}
                          onChange={(e) => 
                            updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)
                          }
                          className="w-20"
                          disabled={exercise.completed}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs">RPE</Label>
                        <Select 
                          value={set.rpe?.toString() || ''} 
                          onValueChange={(value) => 
                            updateSet(exerciseIndex, setIndex, 'rpe', parseInt(value))
                          }
                          disabled={exercise.completed}
                        >
                          <SelectTrigger className="w-16">
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {!exercise.completed && exercise.sets.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSet(exerciseIndex, setIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="How did the session feel? Any observations or modifications..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Session Controls */}
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div className="space-y-1">
            <p className="font-medium">Session Progress</p>
            <p className="text-sm text-muted-foreground">
              {exercises.filter(e => e.completed).length} of {exercises.length} exercises completed
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSessionStarted(false)}>
              <Square className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button onClick={endSession}>
              <Save className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}