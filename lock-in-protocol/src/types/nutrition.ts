import { MealType, SupplementType } from '@prisma/client'

export interface MealEntry {
  id: string
  userId: string
  date: Date
  mealType: MealType
  completed: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface SupplementLog {
  id: string
  userId: string
  date: Date
  supplementType: SupplementType
  timing: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NutritionDay {
  date: Date
  meals: MealEntry[]
  supplements: SupplementLog[]
  adherenceRate: number
  waterIntake?: number // liters
}

export interface MealTemplate {
  id: string
  name: string
  mealType: MealType
  description: string
  estimatedCalories?: number
  macros?: {
    protein: number
    carbs: number
    fat: number
  }
}

export interface SupplementProtocol {
  supplementType: SupplementType
  timing: string[]
  dosage: string
  benefits: string
  notes?: string
}

export interface HydrationGoal {
  dailyTarget: number // liters
  currentIntake: number
  reminders: Date[]
}