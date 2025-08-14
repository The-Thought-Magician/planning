import { TimeBlockCategory } from '@prisma/client'

export interface TimeBlock {
  id: string
  userId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  category: TimeBlockCategory
  completed: boolean
  notes?: string
  pomodoroCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleDay {
  date: Date
  timeBlocks: TimeBlock[]
  adherenceRate: number
}

export interface PomodoroSession {
  id: string
  timeBlockId: string
  duration: number // minutes
  completed: boolean
  startTime: Date
  endTime?: Date
}

export interface ScheduleTemplate {
  id: string
  name: string
  description: string
  timeBlocks: Omit<TimeBlock, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
}

export type ScheduleView = 'day' | 'week' | 'month'