export interface DailyMetric {
  id: string
  userId: string
  date: Date
  scheduleAdherence: number // 0-1
  workoutCompleted: boolean
  deepWorkHours: number
  sleepQuality?: number // 1-10
  energyLevel?: number // 1-10
  stressLevel?: number // 1-10
  pomodoroCount: number
  createdAt: Date
  updatedAt: Date
}

export interface WeeklyReview {
  id: string
  userId: string
  weekStarting: Date
  workedWell: string[]
  challenges: string[]
  improvements: string[]
  overallRating: number // 1-10
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductivityMetrics {
  period: 'week' | 'month' | 'quarter'
  averageAdherence: number
  totalDeepWorkHours: number
  totalPomodoroSessions: number
  workoutCompletionRate: number
  trendDirection: 'improving' | 'stable' | 'declining'
}

export interface PerformanceTrend {
  date: Date
  value: number
  metric: string
  category: string
}

export interface WeeklyInsight {
  title: string
  description: string
  type: 'success' | 'warning' | 'info'
  actionable: boolean
  recommendation?: string
}

export interface AnalyticsSummary {
  period: Date
  scheduleAdherence: {
    average: number
    trend: number // percentage change from previous period
    bestDay: Date
    worstDay: Date
  }
  workoutMetrics: {
    completionRate: number
    averageDuration: number
    streak: number
  }
  productivityMetrics: {
    deepWorkHours: number
    pomodoroSessions: number
    averageEnergyLevel: number
    averageFocusScore: number
  }
  insights: WeeklyInsight[]
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
  category?: string
}

export interface ComparisonData {
  current: number
  previous: number
  percentageChange: number
  trend: 'up' | 'down' | 'stable'
}