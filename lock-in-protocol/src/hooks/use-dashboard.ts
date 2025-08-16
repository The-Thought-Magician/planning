import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, handleApiError } from '@/lib/api'
import { toast } from 'sonner'

// Dashboard Analytics
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: api.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

export const useWeeklyAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'weekly'],
    queryFn: api.getWeeklyAnalytics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  })
}

// Daily Metrics
export const useDailyMetrics = (date?: string) => {
  return useQuery({
    queryKey: ['metrics', 'daily', date],
    queryFn: () => api.getDailyMetrics(date),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useCreateDailyMetric = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createDailyMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Metrics updated successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to update metrics'),
  })
}

// Time Blocks
export const useTimeBlocks = (date?: string) => {
  return useQuery({
    queryKey: ['time-blocks', date],
  queryFn: () => api.getTimeBlocks(date),
  })
}

export const useCreateTimeBlock = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createTimeBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Time block created successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to create time block'),
  })
}

// Schedule Template
export const useScheduleTemplate = () => {
  return useQuery({
    queryKey: ['schedule', 'template'],
  queryFn: api.getScheduleTemplate,
  })
}

// Quick Actions
export const useQuickWorkout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Workout logged successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to log workout'),
  })
}

export const useQuickMeal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Meal logged successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to log meal'),
  })
}

// Achievements & Habits
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
  queryFn: api.getAchievements,
  })
}

export const useHabits = () => {
  return useQuery({
    queryKey: ['habits'],
  queryFn: api.getHabits,
  })
}

export const useUpdateHabit = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Record<string, unknown> }) =>
      api.updateHabit(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Habit updated successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to update habit'),
  })
}

// Milestones
export const useMilestones = () => {
  return useQuery({
    queryKey: ['milestones'],
  queryFn: api.getMilestones,
  })
}

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Record<string, unknown> }) =>
      api.updateMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Milestone updated successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to update milestone'),
  })
}

// Exercises & Progressive Overload
export const useExercises = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['exercises', params],
  queryFn: () => api.getExercises(params),
  })
}

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: ['exercises', id],
    queryFn: () => api.getExercise(id),
  enabled: !!id,
  })
}

export const useUpdateExercise = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Record<string, unknown> }) =>
      api.updateExercise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      toast.success('Exercise updated successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to update exercise'),
  })
}

// Workouts
export const useWorkouts = (params?: Record<string, string>) => {
  return useQuery({
    queryKey: ['workouts', params],
  queryFn: () => api.getWorkouts(params),
  })
}

// Nutrition
export const useMeals = (date?: string) => {
  return useQuery({
    queryKey: ['nutrition', 'meals', date],
  queryFn: () => api.getMeals(date),
  })
}

export const useSupplements = (date?: string) => {
  return useQuery({
    queryKey: ['nutrition', 'supplements', date],
  queryFn: () => api.getSupplements(date),
  })
}

export const useHydration = (date?: string) => {
  return useQuery({
    queryKey: ['nutrition', 'hydration', date],
  queryFn: () => api.getHydration(date),
  })
}

export const useCreateMeal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createMeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'meals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Meal logged successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to log meal'),
  })
}

export const useCreateSupplement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createSupplement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'supplements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Supplement logged successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to log supplement'),
  })
}

export const useUpdateHydration = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.updateHydration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'hydration'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Hydration updated successfully')
    },
    onError: (error) => handleApiError(error, 'Failed to update hydration'),
  })
}

// Performance Analytics
export const usePerformanceAnalytics = (days?: number) => {
  return useQuery({
    queryKey: ['analytics', 'performance', days],
  queryFn: () => api.getPerformanceAnalytics(days),
  })
}