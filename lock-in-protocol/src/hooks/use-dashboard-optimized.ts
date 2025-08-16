import { useQuery } from '@tanstack/react-query'

// Optimized dashboard hook that fetches all data in one API call
export const useConsolidatedDashboard = () => {
  return useQuery({
    queryKey: ['dashboard-consolidated'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard-consolidated')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      const data = await response.json()
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes 
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  })
}

// Individual selectors for components that need specific data
export const useDashboardAnalytics = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.dashboard,
    ...rest
  }
}

export const useDashboardMetrics = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.dailyMetrics,
    ...rest
  }
}

export const useDashboardTimeBlocks = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.timeBlocks,
    ...rest
  }
}

export const useDashboardMilestones = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.milestones,
    ...rest
  }
}

// Compatibility aliases
export const useDashboardHabits = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.milestones?.filter((m: any) => m.type === 'HABIT') || [],
    ...rest
  }
}

export const useDashboardAchievements = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.milestones?.filter((m: any) => m.completed === true) || [],
    ...rest
  }
}

export const useDashboardWeekly = () => {
  const { data, ...rest } = useConsolidatedDashboard()
  return {
    data: data?.weeklyAnalytics,
    ...rest
  }
}