'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, Dumbbell, Target, TrendingUp, Zap } from 'lucide-react'
import { WorkoutType } from '@prisma/client'

interface WorkoutStats {
  currentWeek: number
  completedWorkouts: number
  totalWorkouts: number
  streak: number
  lastWorkout: {
    type: WorkoutType
    date: string
    duration: number
  } | null
  nextWorkout: {
    type: WorkoutType
    scheduled: string
  } | null
}

const WORKOUT_SCHEDULES = {
  [WorkoutType.UPPER_1_PUSH]: {
    name: 'Upper 1 (Push Focus)',
    description: 'Chest, Shoulders, Triceps',
    color: 'bg-red-500',
    exercises: ['Bench Press', 'Overhead Press', 'Incline DB Press', 'Dips', 'Lateral Raises']
  },
  [WorkoutType.LOWER_1_QUAD]: {
    name: 'Lower 1 (Quad Focus)',
    description: 'Quads, Glutes, Calves',
    color: 'bg-blue-500',
    exercises: ['Squats', 'Bulgarian Split Squats', 'Leg Press', 'Calf Raises', 'Leg Extensions']
  },
  [WorkoutType.UPPER_2_PULL]: {
    name: 'Upper 2 (Pull Focus)', 
    description: 'Back, Biceps, Rear Delts',
    color: 'bg-green-500',
    exercises: ['Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Face Pulls', 'Bicep Curls']
  },
  [WorkoutType.LOWER_2_HAMSTRING_GLUTE]: {
    name: 'Lower 2 (Posterior Chain)',
    description: 'Hamstrings, Glutes, Lower Back',
    color: 'bg-purple-500',
    exercises: ['Deadlifts', 'Romanian Deadlifts', 'Hip Thrusts', 'Hamstring Curls', 'Good Mornings']
  },
  [WorkoutType.HIIT_CARDIO]: {
    name: 'HIIT Cardio',
    description: '30s work / 30s rest cycles',
    color: 'bg-orange-500',
    exercises: ['High Knees', 'Burpees', 'Jump Squats', 'Mountain Climbers', 'Sprint Intervals']
  },
  [WorkoutType.MOBILITY_RECOVERY]: {
    name: 'Mobility & Recovery',
    description: 'Stretching and mobility work',
    color: 'bg-teal-500',
    exercises: ['Hip Flexor Stretch', 'Shoulder Dislocations', 'Cat-Cow', 'Pigeon Pose', 'Spinal Twists']
  }
}

export function WorkoutDashboard() {
  const [stats] = useState<WorkoutStats>({
    currentWeek: 1,
    completedWorkouts: 3,
    totalWorkouts: 4,
    streak: 5,
    lastWorkout: {
      type: WorkoutType.UPPER_1_PUSH,
      date: '2024-01-15',
      duration: 75
    },
    nextWorkout: {
      type: WorkoutType.LOWER_1_QUAD,
      scheduled: '2024-01-16T10:00:00'
    }
  })

  const workoutProgress = (stats.completedWorkouts / stats.totalWorkouts) * 100
  const currentDate = new Date()
  const todayWorkout = getCurrentWorkout()

  function getCurrentWorkout() {
    const dayOfWeek = currentDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const workoutRotation = [
      WorkoutType.UPPER_1_PUSH,
      WorkoutType.LOWER_1_QUAD,
      WorkoutType.UPPER_2_PULL,
      WorkoutType.LOWER_2_HAMSTRING_GLUTE
    ]
    return workoutRotation[dayOfWeek % 4]
  }

  return (
    <div className="space-y-6">
      {/* Weekly Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedWorkouts}/{stats.totalWorkouts}</div>
            <Progress value={workoutProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {workoutProgress.toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.streak}</div>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Week {stats.currentWeek}</div>
            <p className="text-xs text-muted-foreground">4-day split cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lastWorkout?.duration || 0}min</div>
            <p className="text-xs text-muted-foreground">
              {stats.lastWorkout?.type.replace('_', ' ') || 'No sessions'}
            </p>
          </CardContent>
        </Card>
      </div>

  {/* Today&apos;s Workout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Today&apos;s Workout
          </CardTitle>
          <CardDescription>
            Scheduled training session for {currentDate.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayWorkout && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    {WORKOUT_SCHEDULES[todayWorkout].name}
                  </h3>
                  <p className="text-muted-foreground">
                    {WORKOUT_SCHEDULES[todayWorkout].description}
                  </p>
                </div>
                <Badge className={`${WORKOUT_SCHEDULES[todayWorkout].color} text-white`}>
                  {todayWorkout.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Key Exercises:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {WORKOUT_SCHEDULES[todayWorkout].exercises.slice(0, 4).map((exercise, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {exercise}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm">
                  Start Workout
                </Button>
                <Button size="sm" variant="outline">
                  View Plan
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4-Day Split Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            4-Day Split Overview
          </CardTitle>
          <CardDescription>
            Your weekly training rotation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(WORKOUT_SCHEDULES)
              .filter(([key]) => !key.includes('HIIT') && !key.includes('MOBILITY'))
              .map(([type, info]) => (
              <div key={type} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${info.color}`} />
                  <h4 className="font-medium text-sm">{info.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{info.description}</p>
                <div className="text-xs">
                  <p className="font-medium">Focus Areas:</p>
                  <p className="text-muted-foreground">{info.exercises.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}