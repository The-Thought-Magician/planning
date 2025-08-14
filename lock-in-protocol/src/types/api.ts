// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Authentication & User Types
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
  stats?: {
    timeBlocks: number
    workoutSessions: number
    milestones: number
    dailyMetrics: number
  }
}

export interface UserUpdateRequest {
  name?: string
  email?: string
}

// Time Block Types
export interface TimeBlock {
  id: string
  userId: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  category: string
  completed: boolean
  notes?: string
  pomodoroCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface TimeBlockCreateRequest {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  category: string
  notes?: string
  pomodoroCount?: number
}

export interface TimeBlockUpdateRequest extends Partial<TimeBlockCreateRequest> {
  completed?: boolean
}

// Schedule Template Types
export interface ScheduleTemplate {
  name: string
  description: string
  weeklyStructure: {
    [day: string]: ScheduleTimeBlock[]
  }
  workoutSplit: WorkoutSplit
  nutritionGuidelines: NutritionGuidelines
  pomodoroSettings: PomodoroSettings
}

export interface ScheduleTimeBlock {
  title: string
  startTime: string
  endTime: string
  category: string
  description: string
}

export interface WorkoutSplit {
  "4-day-split": {
    [key: string]: {
      type: string
      focus: string
      exercises: string[]
    }
  }
}

export interface NutritionGuidelines {
  supplementSchedule: {
    [timing: string]: string[]
  }
  mealTiming: {
    [meal: string]: string
  }
  hydrationTarget: string
}

export interface PomodoroSettings {
  workDuration: number
  shortBreak: number
  longBreak: number
  longBreakInterval: number
}

// Workout Types
export interface ExerciseSet {
  reps: number
  weight: number
  completed: boolean
  rpe?: number
}

export interface WorkoutExercise {
  id: string
  sessionId: string
  exerciseName: string
  sets: ExerciseSet[]
  completed: boolean
  notes?: string
  session?: {
    id: string
    date: Date
    type: string
    completed: boolean
  }
}

export interface WorkoutSession {
  id: string
  userId: string
  date: Date
  type: string
  completed: boolean
  duration?: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  exercises: WorkoutExercise[]
}

export interface WorkoutCreateRequest {
  date: Date
  type: string
  duration?: number
  notes?: string
  exercises: {
    exerciseName: string
    sets: ExerciseSet[]
    notes?: string
  }[]
}

export interface WorkoutUpdateRequest extends Partial<WorkoutCreateRequest> {
  completed?: boolean
}

export interface WorkoutTemplate {
  name: string
  description: string
  estimatedDuration: number
  targetMuscleGroups: string[]
  exercises: {
    name: string
    type: string
    primaryMuscle: string
    sets: ExerciseSet[]
    restTime: number
    notes: string
  }[]
}

export interface ExerciseCreateRequest {
  sessionId: string
  exerciseName: string
  sets: ExerciseSet[]
  notes?: string
}

export interface ExerciseUpdateRequest extends Partial<ExerciseCreateRequest> {
  completed?: boolean
}

// Nutrition Types
export interface MealEntry {
  id: string
  userId: string
  date: Date
  mealType: string
  completed: boolean
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MealCreateRequest {
  date: Date
  mealType: string
  notes?: string
}

export interface MealUpdateRequest extends Partial<MealCreateRequest> {
  completed?: boolean
}

export interface HydrationEntry {
  id: string
  date: Date
  waterIntake: number
  target: number
  notes?: string
  progress: number
  createdAt: Date
  updatedAt: Date
}

export interface HydrationCreateRequest {
  date: Date
  waterIntake: number
  notes?: string
}

export interface HydrationUpdateRequest {
  waterIntakeIncrement?: number
  waterIntake?: number
  notes?: string
}

export interface SupplementLog {
  id: string
  userId: string
  date: Date
  supplementType: string
  timing: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SupplementCreateRequest {
  date: Date
  supplementType: string
  timing: string
}

export interface SupplementUpdateRequest extends Partial<SupplementCreateRequest> {
  completed?: boolean
}

// Milestone & Goal Types
export interface Milestone {
  id: string
  userId: string
  category: string
  title: string
  description: string
  targetDate?: Date
  completed: boolean
  progress: number
  createdAt: Date
  updatedAt: Date
  isOverdue?: boolean
  daysUntilTarget?: number
  progressPercentage?: number
}

export interface MilestoneCreateRequest {
  category: string
  title: string
  description: string
  targetDate?: Date
  progress?: number
}

export interface MilestoneUpdateRequest extends Partial<MilestoneCreateRequest> {
  completed?: boolean
}

export interface Habit {
  id: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  targetCount: number
  currentStreak: number
  bestStreak: number
  completedToday: boolean
  totalCompletions: number
  createdAt: Date
  updatedAt: Date
}

export interface HabitCreateRequest {
  title: string
  description: string
  category: string
  frequency?: 'daily' | 'weekly' | 'monthly'
  targetCount?: number
}

export interface HabitUpdateRequest extends Partial<HabitCreateRequest> {}

export interface HabitLogRequest {
  logCompletion: boolean
  notes?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  badge: string
  category: string
  requirement: string
  points: number
  unlocked: boolean
  unlockedAt?: Date
  progress: number
}

export interface AchievementCreateRequest {
  title: string
  description: string
  badge: string
  category: string
  unlockedAt?: Date
}

// Analytics & Progress Types
export interface DailyMetric {
  id: string
  userId: string
  date: Date
  scheduleAdherence: number
  workoutCompleted: boolean
  deepWorkHours: number
  sleepQuality?: number
  energyLevel?: number
  stressLevel?: number
  pomodoroCount: number
  createdAt: Date
  updatedAt: Date
  productivityScore?: number
  wellnessScore?: number
}

export interface DailyMetricCreateRequest {
  date: Date
  scheduleAdherence: number
  workoutCompleted?: boolean
  deepWorkHours?: number
  sleepQuality?: number
  energyLevel?: number
  stressLevel?: number
  pomodoroCount?: number
}

export interface DashboardData {
  today: {
    date: Date
    metrics: DailyMetric
    completedTimeBlocks: number
    totalTimeBlocks: number
  }
  thisWeek: {
    startDate: Date
    endDate: Date
    timeBlocks: {
      total: number
      completed: number
      adherenceRate: number
    }
    workouts: {
      total: number
      completed: number
      totalExercises: number
    }
    nutrition: {
      mealsLogged: number
      supplementsCompleted: number
      nutritionScore: number
    }
  }
  monthlyTrends: {
    averageScheduleAdherence: number
    averageDeepWorkHours: number
    averagePomodoroCount: number
    workoutConsistency: number
    milestonesProgress: {
      total: number
      completed: number
      averageProgress: number
    }
  }
  overallStats: {
    totalDays: number
    counts: {
      timeBlocks: number
      workoutSessions: number
      mealEntries: number
      supplementLogs: number
      milestones: number
      weeklyReviews: number
      dailyMetrics: number
    }
    completionRates: {
      timeBlocks: number
      workouts: number
      milestones: number
    }
  }
  recentActivity: {
    timeBlocks: Array<{
      id: string
      title: string
      category: string
      completed: boolean
      startTime: Date
      endTime: Date
    }>
    workouts: Array<{
      id: string
      type: string
      date: Date
      completed: boolean
      exerciseCount: number
    }>
  }
  insights: string[]
  weeklyReviewSummary?: {
    weekStarting: Date
    overallRating: number
    workedWell: string[]
    needsImprovement: string[]
  }
}

export interface WeeklyReview {
  id: string
  userId: string
  weekStarting: Date
  workedWell: string[]
  challenges: string[]
  improvements: string[]
  overallRating: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WeeklyReviewCreateRequest {
  weekStarting: Date
  workedWell: string[]
  challenges: string[]
  improvements: string[]
  overallRating: number
  notes?: string
}

export interface WeeklyAnalytics {
  weekPeriod: {
    start: Date
    end: Date
    totalDays: number
  }
  schedule: {
    totalTimeBlocks: number
    completedTimeBlocks: number
    adherenceRate: number
    averageScheduleAdherence: number
    categoryBreakdown: Record<string, number>
  }
  productivity: {
    totalPomodoroSessions: number
    totalDeepWorkHours: number
    averagePomodorosPerDay: number
    averageDeepWorkPerDay: number
    productivityScore: number
  }
  fitness: {
    workoutsPlanned: number
    workoutsCompleted: number
    completionRate: number
    totalExercises: number
    workoutTypeBreakdown: Record<string, number>
  }
  nutrition: {
    mealsPlanned: number
    mealsCompleted: number
    mealCompletionRate: number
    supplementsPlanned: number
    supplementsCompleted: number
    supplementCompletionRate: number
  }
  wellness: {
    averageSleepQuality: number
    averageEnergyLevel: number
    averageStressLevel: number
    wellnessScore: number
  }
  milestones: {
    milestonesUpdated: number
    milestonesCompleted: number
    averageProgress: number
  }
  streaks: {
    workoutStreak: number
    pomodoroStreak: number
    scheduleStreak: number
  }
}

export interface PerformanceData {
  period: {
    days: number
    startDate: Date
    endDate: Date
  }
  overallTrends: {
    scheduleAdherenceTrend: TrendData
    productivityTrend: TrendData
    wellnessTrend: TrendData
    consistencyScore: number
  }
  categoryPerformance: {
    fitness: FitnessPerformance
    productivity: ProductivityPerformance
    nutrition: NutritionPerformance
    goals: GoalsPerformance
    habits: HabitsPerformance
  }
  dailyPerformance: DailyPerformanceData[]
  weeklyPerformance: WeeklyPerformanceData[]
  insights: string[]
  comparisons: {
    thisWeekVsLast?: WeeklyComparison
    thisMonthVsLast?: MonthlyComparison
    personalBests: PersonalBests
  }
  goalTracking: {
    milestoneProgress: {
      overall: number
      byCategory: Record<string, number>
    }
    targetAchievement: TargetAchievement
    streakAnalysis: StreakAnalysis
  }
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable'
  percentage: number
  data: number[]
}

export interface FitnessPerformance {
  totalWorkouts: number
  completedWorkouts: number
  completionRate: number
  averageExercisesPerWorkout: number
  workoutFrequency: number
  workoutTypes: Record<string, number>
  progressiveDays: number
}

export interface ProductivityPerformance {
  totalPomodoroSessions: number
  totalDeepWorkHours: number
  averagePomodorosPerDay: number
  averageDeepWorkPerDay: number
  timeBlockCompletionRate: number
  averageScheduleAdherence: number
  productivityCategories: Record<string, number>
}

export interface NutritionPerformance {
  mealsLogged: number
  mealsCompleted: number
  mealCompletionRate: number
  supplementsLogged: number
  supplementsCompleted: number
  supplementCompletionRate: number
  mealTypes: Record<string, number>
  supplementTypes: Record<string, number>
}

export interface GoalsPerformance {
  totalMilestones: number
  completedMilestones: number
  completionRate: number
  averageProgress: number
  categoryDistribution: Record<string, number>
  overdueCount: number
}

export interface HabitsPerformance {
  morningRoutineConsistency: number
  eveningRoutineConsistency: number
  meditationStreak: number
  mobilityStreak: number
  deepWorkStreak: number
}

export interface DailyPerformanceData {
  date: Date
  scheduleAdherence: number
  pomodoroCount: number
  deepWorkHours: number
  workoutCompleted: boolean
  timeBlocksCompleted: number
  sleepQuality?: number
  energyLevel?: number
  stressLevel?: number
}

export interface WeeklyPerformanceData {
  weekStarting: Date
  overallRating: number
  workedWell: number
  challenges: number
  improvements: number
}

export interface WeeklyComparison {
  thisWeekPerformance: number
  lastWeekPerformance: number
  improvement: number
}

export interface MonthlyComparison {
  thisMonthPerformance: number
  lastMonthPerformance: number
  improvement: number
}

export interface PersonalBests {
  bestPomodoroDay: number
  bestDeepWorkDay: number
  bestScheduleAdherence: number
  longestWorkoutStreak: number
  highestWeeklyPomodoros: number
}

export interface TargetAchievement {
  pomodoroTargetDays: number
  deepWorkTargetDays: number
  workoutTargetWeeks: number
  overallTargetRate: number
}

export interface StreakAnalysis {
  currentPomodoroStreak: number
  currentWorkoutStreak: number
  currentScheduleStreak: number
  longestPomodoroStreak: number
  longestWorkoutStreak: number
}

// Error Types
export interface ApiError {
  success: false
  error: string
  details?: any
}

// Query Parameter Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
  today?: 'true' | 'false'
}

export interface FilterParams {
  search?: string
  category?: string
  type?: string
  completed?: 'true' | 'false'
  active?: 'true' | 'false'
}

export interface TimeBlockQueryParams extends PaginationParams, DateRangeParams, FilterParams {}
export interface WorkoutQueryParams extends PaginationParams, DateRangeParams, FilterParams {}
export interface MealQueryParams extends PaginationParams, DateRangeParams, FilterParams {}
export interface SupplementQueryParams extends PaginationParams, DateRangeParams, FilterParams {}
export interface MilestoneQueryParams extends PaginationParams, FilterParams {
  overdue?: 'true' | 'false'
}
export interface HabitQueryParams extends PaginationParams, FilterParams {
  frequency?: 'daily' | 'weekly' | 'monthly'
}
export interface AchievementQueryParams extends PaginationParams, FilterParams {
  unlocked?: 'true' | 'false'
}
export interface MetricsQueryParams extends PaginationParams, DateRangeParams {}

// Utility Types for API Endpoints
export type GetTimeBlocksResponse = PaginatedResponse<TimeBlock>
export type GetWorkoutsResponse = PaginatedResponse<WorkoutSession>
export type GetMealsResponse = PaginatedResponse<MealEntry>
export type GetSupplementsResponse = PaginatedResponse<SupplementLog>
export type GetMilestonesResponse = PaginatedResponse<Milestone>
export type GetHabitsResponse = PaginatedResponse<Habit>
export type GetAchievementsResponse = PaginatedResponse<Achievement>
export type GetMetricsResponse = PaginatedResponse<DailyMetric>

export type CreateTimeBlockResponse = ApiResponse<TimeBlock>
export type CreateWorkoutResponse = ApiResponse<WorkoutSession>
export type CreateMealResponse = ApiResponse<MealEntry>
export type CreateSupplementResponse = ApiResponse<SupplementLog>
export type CreateMilestoneResponse = ApiResponse<Milestone>
export type CreateHabitResponse = ApiResponse<Habit>
export type CreateMetricResponse = ApiResponse<DailyMetric>

export type UpdateTimeBlockResponse = ApiResponse<TimeBlock>
export type UpdateWorkoutResponse = ApiResponse<WorkoutSession>
export type UpdateMealResponse = ApiResponse<MealEntry>
export type UpdateSupplementResponse = ApiResponse<SupplementLog>
export type UpdateMilestoneResponse = ApiResponse<Milestone>
export type UpdateHabitResponse = ApiResponse<Habit>
export type UpdateMetricResponse = ApiResponse<DailyMetric>

export type GetUserResponse = ApiResponse<User>
export type UpdateUserResponse = ApiResponse<User>
export type GetScheduleTemplateResponse = ApiResponse<ScheduleTemplate>
export type GetWorkoutTemplatesResponse = ApiResponse<{ templates: Record<string, WorkoutTemplate> }>
export type GetHydrationResponse = ApiResponse<HydrationEntry>
export type GetDashboardResponse = ApiResponse<DashboardData>
export type GetWeeklyAnalyticsResponse = ApiResponse<WeeklyAnalytics>
export type GetPerformanceResponse = ApiResponse<PerformanceData>

// HTTP Method Types for Routes
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS'

// API Endpoint Configuration
export interface APIEndpoint {
  path: string
  methods: HTTPMethod[]
  description: string
  requiresAuth: boolean
  requestType?: string
  responseType: string
}

// Complete API configuration type
export interface LockInProtocolAPI {
  auth: {
    user: APIEndpoint
  }
  timeBlocks: {
    list: APIEndpoint
    create: APIEndpoint
    get: APIEndpoint
    update: APIEndpoint
    delete: APIEndpoint
  }
  schedule: {
    template: APIEndpoint
  }
  workouts: {
    list: APIEndpoint
    create: APIEndpoint
    get: APIEndpoint
    update: APIEndpoint
    delete: APIEndpoint
    templates: APIEndpoint
  }
  exercises: {
    list: APIEndpoint
    create: APIEndpoint
    update: APIEndpoint
    delete: APIEndpoint
  }
  nutrition: {
    meals: {
      list: APIEndpoint
      create: APIEndpoint
      get: APIEndpoint
      update: APIEndpoint
      delete: APIEndpoint
    }
    hydration: {
      get: APIEndpoint
      create: APIEndpoint
      update: APIEndpoint
    }
    supplements: {
      list: APIEndpoint
      create: APIEndpoint
      update: APIEndpoint
      delete: APIEndpoint
    }
  }
  milestones: {
    list: APIEndpoint
    create: APIEndpoint
    get: APIEndpoint
    update: APIEndpoint
    delete: APIEndpoint
  }
  habits: {
    list: APIEndpoint
    create: APIEndpoint
    get: APIEndpoint
    update: APIEndpoint
    delete: APIEndpoint
  }
  achievements: {
    list: APIEndpoint
    create: APIEndpoint
  }
  analytics: {
    metrics: APIEndpoint
    dashboard: APIEndpoint
    weekly: APIEndpoint
    performance: APIEndpoint
  }
}