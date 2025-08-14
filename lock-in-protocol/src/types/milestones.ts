import { MilestoneCategory } from '@prisma/client'

export interface Milestone {
  id: string
  userId: string
  category: MilestoneCategory
  title: string
  description: string
  targetDate?: Date
  completed: boolean
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
}

export interface HabitStreak {
  id: string
  habitName: string
  category: string
  currentStreak: number
  bestStreak: number
  lastCompleted: Date
  isActive: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: string
  unlockedAt?: Date
  progress: number // 0-100
  requirement: string
}

export interface Goal {
  id: string
  title: string
  description: string
  category: MilestoneCategory
  targetValue?: number
  currentValue: number
  unit?: string
  deadline?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  steps: GoalStep[]
}

export interface GoalStep {
  id: string
  title: string
  description?: string
  completed: boolean
  order: number
}

export interface MilestoneProgress {
  category: MilestoneCategory
  totalGoals: number
  completedGoals: number
  inProgressGoals: number
  averageProgress: number
}