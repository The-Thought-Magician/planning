'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Dumbbell, 
  UtensilsCrossed, 
 
  Timer,
  Plus,
  CheckCircle,
  Calendar,
  Droplets
} from 'lucide-react'
import Link from 'next/link'
import { useTimeBlocks, useQuickWorkout, useQuickMeal } from '@/hooks/use-dashboard'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'

// Minimal shape used by this component
interface UITimeBlock {
  id: string
  title: string
  startTime: string | Date
  endTime: string | Date
  category: string
  completed: boolean
}

export function QuickActions() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  
  const today = new Date().toISOString().split('T')[0]
  const { data: timeBlocksResponse, isLoading: timeBlocksLoading } = useTimeBlocks(today)
  const workoutMutation = useQuickWorkout()
  const mealMutation = useQuickMeal()
  
  const queryClient = useQueryClient()
  const hydrationMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.createMeal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
  
  const updateTimeBlockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => 
      api.updateTimeBlock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-blocks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const timeBlocks: UITimeBlock[] = timeBlocksResponse?.success
    ? ((timeBlocksResponse.data as unknown as UITimeBlock[]) || [])
    : []
  const upcomingTasks = getUpcomingTasks(timeBlocks)
  
  // Find current active time block
  const currentTimeBlock = timeBlocks.find((block) => {
    const now = new Date()
    const startTime = new Date(block.startTime as any)
    const endTime = new Date(block.endTime as any)
    return now >= startTime && now <= endTime && !block.completed
  })

  const quickActions = [
    {
      id: 'start-pomodoro',
      title: 'Start Pomodoro',
      description: '25-minute focus session',
      icon: Timer,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: 'start-timer',
    },
    {
      id: 'log-workout',
      title: 'Quick Workout',
      description: 'Log completed session',
      icon: Dumbbell,
      color: 'bg-red-500 hover:bg-red-600',
      action: 'log-workout',
    },
    {
      id: 'track-meal',
      title: 'Quick Meal',
      description: 'Log nutrition intake',
      icon: UtensilsCrossed,
      color: 'bg-green-500 hover:bg-green-600',
      action: 'track-meal',
    },
    {
      id: 'log-hydration',
      title: 'Add Water',
      description: '+250ml hydration',
      icon: Droplets,
      color: 'bg-cyan-500 hover:bg-cyan-600',
      action: 'log-hydration',
    },
    {
      id: 'schedule-time',
      title: 'Edit Schedule',
      description: 'Adjust time blocks',
      icon: Calendar,
      color: 'bg-purple-500 hover:bg-purple-600',
      href: '/calendar',
    },
    {
      id: 'complete-activity',
      title: 'Mark Complete',
      description: currentTimeBlock ? `Complete: ${currentTimeBlock.title}` : 'No active block',
      icon: CheckCircle,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      action: 'complete-current',
      disabled: !currentTimeBlock,
    },
  ]

  const handleAction = async (actionType: string) => {
    setIsLoading(actionType)
    
    try {
      switch (actionType) {
        case 'start-timer':
          toast.info('Pomodoro timer would start here')
          break
          
        case 'log-workout':
          await workoutMutation.mutateAsync({
            date: new Date(),
            type: 'Quick Log',
            completed: true,
            exercises: []
          })
          break
          
        case 'track-meal':
          await mealMutation.mutateAsync({
            date: new Date(),
            mealType: 'snack',
            completed: true,
            notes: 'Quick meal log'
          })
          break
          
        case 'log-hydration':
          await hydrationMutation.mutateAsync({
            date: new Date(),
            waterIntake: 250
          })
          break
          
        case 'complete-current':
          if (currentTimeBlock) {
            await updateTimeBlockMutation.mutateAsync({
              id: currentTimeBlock.id,
              data: { completed: true }
            })
            toast.success('Current activity marked as complete!')
          } else {
            toast.info('No active time block to complete')
          }
          break
          
        default:
          console.log('Unknown action:', actionType)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Action failed: ${message}`)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Fast-track your Lock-In Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              
              if (action.href) {
                return (
                  <Link key={action.id} href={action.href}>
                    <Button
                      variant="outline"
                      className={`h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200 ${action.color} text-white border-0`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <div className="text-center">
                        <div className="text-sm font-medium">{action.title}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </Button>
                  </Link>
                )
              }

              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200 ${
                    action.disabled ? 'bg-gray-400 hover:bg-gray-400 cursor-not-allowed' : action.color
                  } text-white border-0`}
                  onClick={() => !action.disabled && handleAction(action.action!)}
                  disabled={action.disabled || isLoading === action.action}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs opacity-90">
                      {isLoading === action.action ? 'Processing...' : action.description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <CardDescription>Next activities in your schedule</CardDescription>
            </div>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {timeBlocksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        task.priority === 'high' 
                          ? 'border-red-200 text-red-700' 
                          : 'border-yellow-200 text-yellow-700'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{task.time}</div>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No upcoming tasks for today</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get upcoming tasks from time blocks
function getUpcomingTasks(timeBlocks: UITimeBlock[]): Array<{
  id: string;
  title: string;
  time: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const currentTime = new Date()
  const today = new Date().toDateString()
  
  return timeBlocks
    .filter(block => {
      const blockDate = new Date(block.startTime as any).toDateString()
      const blockTime = new Date(block.startTime as any)
      return blockDate === today && blockTime > currentTime && !block.completed
    })
    .sort((a, b) => new Date(a.startTime as any).getTime() - new Date(b.startTime as any).getTime())
    .slice(0, 3)
    .map(block => ({
      id: String(block.id),
      title: String(block.title),
      time: new Date(block.startTime as any).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      category: String(block.category)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
      priority: block.category.includes('WORKOUT') || block.category.includes('DEEP_WORK') ? 'high' as const : 'medium' as const
    }))
}

