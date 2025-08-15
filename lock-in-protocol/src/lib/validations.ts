import { z } from 'zod'
import { TimeBlockCategory, WorkoutType, MealType, SupplementType, MilestoneCategory } from '@prisma/client'

// Time Block Schemas
export const timeBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  category: z.nativeEnum(TimeBlockCategory),
  notes: z.string().optional(),
  pomodoroCount: z.number().optional(),
})

export const scheduleTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  timeBlocks: z.array(timeBlockSchema),
})

// Workout Schemas
export const exerciseSetSchema = z.object({
  reps: z.number().min(1).max(100),
  weight: z.number().min(0).max(1000),
  completed: z.boolean().default(false),
  rpe: z.number().min(1).max(10).optional(),
})

export const workoutExerciseSchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z.array(exerciseSetSchema).min(1, 'At least one set is required'),
  notes: z.string().optional(),
})

export const workoutSessionSchema = z.object({
  date: z.date(),
  type: z.nativeEnum(WorkoutType),
  duration: z.number().min(1).max(300).optional(),
  notes: z.string().optional(),
  exercises: z.array(workoutExerciseSchema),
})

// Nutrition Schemas
export const mealEntrySchema = z.object({
  date: z.date(),
  mealType: z.nativeEnum(MealType),
  notes: z.string().optional(),
})

export const supplementLogSchema = z.object({
  date: z.date(),
  supplementType: z.nativeEnum(SupplementType),
  timing: z.string().min(1, 'Timing is required'),
})

// Milestone Schemas
export const milestoneSchema = z.object({
  category: z.nativeEnum(MilestoneCategory),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  targetDate: z.date().optional(),
  progress: z.number().min(0).max(100).default(0),
})

export const goalStepSchema = z.object({
  title: z.string().min(1, 'Step title is required'),
  description: z.string().optional(),
  order: z.number().min(0),
})

// Analytics Schemas
export const dailyMetricSchema = z.object({
  date: z.date(),
  scheduleAdherence: z.number().min(0).max(1),
  workoutCompleted: z.boolean().default(false),
  deepWorkHours: z.number().min(0).max(24).default(0),
  sleepQuality: z.number().min(1).max(10).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  pomodoroCount: z.number().min(0).default(0),
})

export const weeklyReviewSchema = z.object({
  weekStarting: z.date(),
  workedWell: z.array(z.string()).min(1, 'At least one item required'),
  challenges: z.array(z.string()).min(1, 'At least one item required'),
  improvements: z.array(z.string()).min(1, 'At least one item required'),
  overallRating: z.number().min(1).max(10),
  notes: z.string().optional(),
})

// User Schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
})

// Form Schemas for UI
export const pomodoroTimerSchema = z.object({
  workDuration: z.number().min(15).max(60).default(25),
  shortBreakDuration: z.number().min(5).max(15).default(5),
  longBreakDuration: z.number().min(15).max(30).default(15),
  longBreakInterval: z.number().min(2).max(8).default(4),
})

export const hiitTimerSchema = z.object({
  workDuration: z.number().min(10).max(60).default(30),
  restDuration: z.number().min(10).max(60).default(30),
  totalRounds: z.number().min(5).max(25).default(15),
})

// Additional schemas for completion tracking
export const completionSchema = z.object({
  completed: z.boolean(),
  notes: z.string().optional(),
})

// Achievement schema for manual creation
export const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  badge: z.string().min(1, 'Badge is required'),
  category: z.string().min(1, 'Category is required'),
  unlockedAt: z.date().optional(),
})

// Hydration tracking schema
export const hydrationSchema = z.object({
  date: z.date(),
  waterIntake: z.number().min(0).max(10000), // ml
  notes: z.string().optional()
})

// Export types
export type TimeBlockFormData = z.infer<typeof timeBlockSchema>
export type WorkoutSessionFormData = z.infer<typeof workoutSessionSchema>
export type MealEntryFormData = z.infer<typeof mealEntrySchema>
export type SupplementLogFormData = z.infer<typeof supplementLogSchema>
export type MilestoneFormData = z.infer<typeof milestoneSchema>
export type DailyMetricFormData = z.infer<typeof dailyMetricSchema>
export type WeeklyReviewFormData = z.infer<typeof weeklyReviewSchema>
export type PomodoroTimerFormData = z.infer<typeof pomodoroTimerSchema>
export type HIITTimerFormData = z.infer<typeof hiitTimerSchema>
export type CompletionFormData = z.infer<typeof completionSchema>
export type AchievementFormData = z.infer<typeof achievementSchema>
export type HydrationFormData = z.infer<typeof hydrationSchema>