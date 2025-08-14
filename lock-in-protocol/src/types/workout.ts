import { WorkoutType } from '@prisma/client'

export interface ExerciseSet {
  reps: number
  weight: number // in kg
  completed: boolean
  rpe?: number // Rate of Perceived Exertion (1-10)
}

export interface WorkoutExercise {
  id: string
  sessionId: string
  exerciseName: string
  sets: ExerciseSet[]
  completed: boolean
  notes?: string
}

export interface WorkoutSession {
  id: string
  userId: string
  date: Date
  type: WorkoutType
  completed: boolean
  duration?: number
  notes?: string
  exercises: WorkoutExercise[]
  createdAt: Date
  updatedAt: Date
}

export interface Exercise {
  name: string
  category: string
  muscleGroups: string[]
  equipment: string[]
  instructions: string[]
  tips: string[]
}

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  type: WorkoutType
  exercises: {
    exerciseName: string
    targetSets: number
    targetReps: string // e.g., "8-12", "15-20"
    restTime: number // seconds
  }[]
}

export interface ProgressiveOverload {
  exerciseName: string
  currentWeight: number
  suggestedIncrease: number
  lastPerformed: Date
  trend: 'increasing' | 'plateau' | 'decreasing'
}