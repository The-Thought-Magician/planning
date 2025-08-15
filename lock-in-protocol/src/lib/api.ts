import { toast } from 'sonner'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions {
  method?: string
  headers?: Record<string, string>
  body?: string | null
}

const apiRequest = async <T>(
  endpoint: string,
  options: Partial<FetchOptions> = {}
): Promise<T> => {
  const url = `/api${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  } as const

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new ApiError(response.status, errorData.message || 'Request failed')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error')
  }
}

export const api = {
  // Dashboard & Analytics
  getDashboardData: () => 
    apiRequest<Record<string, unknown>>('/analytics/dashboard'),
  
  getWeeklyAnalytics: () =>
    apiRequest<Record<string, unknown>>('/analytics/weekly'),
  
  getDailyMetrics: (date?: string) =>
    apiRequest<Record<string, unknown>>(`/metrics${date ? `?date=${date}` : ''}`),
  
  createDailyMetric: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Time Blocks
  getTimeBlocks: (date?: string) =>
    apiRequest<Record<string, unknown>>(`/time-blocks${date ? `?date=${date}` : ''}`),
  
  createTimeBlock: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/time-blocks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateTimeBlock: (id: string, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/time-blocks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Schedule Template
  getScheduleTemplate: () =>
    apiRequest<Record<string, unknown>>('/schedule/template'),

  // Workouts
  getWorkouts: (params?: Record<string, string>) =>
    apiRequest<Record<string, unknown>>('/workouts' + (params ? `?${new URLSearchParams(params)}` : '')),
  
  createWorkout: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getWorkoutTemplates: () =>
    apiRequest<Record<string, unknown>>('/workouts/templates'),

  // Nutrition
  getMeals: (date?: string) =>
    apiRequest<Record<string, unknown>>(`/nutrition/meals${date ? `?date=${date}` : ''}`),
  
  createMeal: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getHydration: (date?: string) =>
    apiRequest<Record<string, unknown>>(`/nutrition/hydration${date ? `?date=${date}` : ''}`),

  // Exercises
  getExercises: (params?: Record<string, string>) =>
    apiRequest<Record<string, unknown>>('/exercises' + (params ? `?${new URLSearchParams(params)}` : '')),
  
  getExercise: (id: string) =>
    apiRequest<Record<string, unknown>>(`/exercises/${id}`),
  
  createExercise: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateExercise: (id: string, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/exercises/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Milestones & Habits
  getMilestones: () =>
    apiRequest<Record<string, unknown>>('/milestones'),
  
  createMilestone: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateMilestone: (id: string, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/milestones/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  getHabits: () =>
    apiRequest<Record<string, unknown>>('/habits'),
  
  createHabit: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateHabit: (id: string, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  getAchievements: () =>
    apiRequest<Record<string, unknown>>('/achievements'),

  // Nutrition - Additional endpoints
  getSupplements: (date?: string) =>
    apiRequest<Record<string, unknown>>(`/nutrition/supplements${date ? `?date=${date}` : ''}`),
  
  createSupplement: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/nutrition/supplements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateSupplement: (id: string, data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(`/nutrition/supplements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  createHydration: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/nutrition/hydration', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateHydration: (data: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>('/nutrition/hydration', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Performance Analytics
  getPerformanceAnalytics: (days?: number) =>
    apiRequest<Record<string, unknown>>(`/analytics/performance${days ? `?days=${days}` : ''}`),
}

export const handleApiError = (error: unknown, fallbackMessage = 'Something went wrong') => {
  const message = error instanceof ApiError ? error.message : fallbackMessage
  toast.error(message)
  console.error('API Error:', error)
}