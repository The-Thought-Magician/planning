'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

// Component to prefetch dashboard data
export function PrefetchDashboard() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Prefetch the consolidated dashboard data
    queryClient.prefetchQuery({
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
    })
  }, [queryClient])

  return null // This component doesn't render anything
}