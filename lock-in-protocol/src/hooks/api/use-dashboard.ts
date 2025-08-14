import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  DashboardData, 
  ApiResponse, 
  DailyMetric, 
  TimeBlock,
  GetDashboardResponse,
  GetMetricsResponse,
  GetTimeBlocksResponse,
  TimeBlockUpdateRequest,
  UpdateTimeBlockResponse
} from '@/types/api'

const API_BASE = '/api'

// API utility functions
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Dashboard data hook
export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchApi<GetDashboardResponse>('/analytics/dashboard'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Today's metrics hook
export function useTodaysMetrics() {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['metrics', 'today', today],
    queryFn: () => fetchApi<GetMetricsResponse>(`/metrics?today=true&startDate=${today}&endDate=${today}`),
    staleTime: 30 * 1000, // 30 seconds for real-time feel
  })
}

// Today's time blocks hook
export function useTodaysTimeBlocks() {
  const today = new Date().toISOString().split('T')[0]
  
  return useQuery({
    queryKey: ['time-blocks', 'today', today],
    queryFn: () => fetchApi<GetTimeBlocksResponse>(`/time-blocks?today=true&startDate=${today}&endDate=${today}&sortBy=startTime&sortOrder=asc`),
    staleTime: 30 * 1000, // 30 seconds
  })
}

// Update time block completion
export function useUpdateTimeBlock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TimeBlockUpdateRequest }) =>
      fetchApi<UpdateTimeBlockResponse>(`/time-blocks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (response) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      
      // Optimistically update the cache
      const today = new Date().toISOString().split('T')[0]
      queryClient.setQueryData<GetTimeBlocksResponse>(
        ['time-blocks', 'today', today], 
        (oldData) => {
          if (!oldData?.success || !oldData.data) return oldData
          return {
            ...oldData,
            data: oldData.data.map(block => 
              block.id === response.data?.id ? { ...block, ...response.data } : block
            )
          }
        }
      )
    },
    onError: (error) => {
      console.error('Failed to update time block:', error)
    },
  })
}

// Quick actions hooks
export function useQuickWorkoutLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (workoutData: any) =>
      fetchApi('/workouts', {
        method: 'POST',
        body: JSON.stringify(workoutData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['workouts'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

export function useQuickMealLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mealData: any) =>
      fetchApi('/nutrition/meals', {
        method: 'POST',
        body: JSON.stringify(mealData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

export function useQuickHydrationLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (hydrationData: any) =>
      fetchApi('/nutrition/hydration', {
        method: 'POST',
        body: JSON.stringify(hydrationData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

// Schedule template hook
export function useScheduleTemplate() {
  return useQuery({
    queryKey: ['schedule', 'template'],
    queryFn: () => fetchApi('/schedule/template'),
    staleTime: 5 * 60 * 1000, // 5 minutes (templates don't change often)
  })
}