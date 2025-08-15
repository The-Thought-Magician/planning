'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, Edit, MoreHorizontal, Play, AlertCircle } from 'lucide-react'
import { TIME_BLOCK_CATEGORIES } from '@/lib/constants'
import { TimeBlockCategory } from '@prisma/client'
import { useTimeBlocks } from '@/hooks/use-dashboard'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'

// Component-specific TimeBlock interface
interface UITimeBlock {
  id: string
  title: string
  startTime: string | Date
  endTime: string | Date
  category: string
  completed: boolean
  notes?: string
  pomodoroCount?: number
}

// Helper functions
function formatTimeFromDate(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

function findNextIncompleteTimeBlock(timeBlocks: UITimeBlock[]) {
  const currentTime = getCurrentTime()
  const incompleteBlocks = timeBlocks
    .filter(block => !block.completed)
    .sort((a, b) => formatTimeFromDate(new Date(a.startTime as any)).localeCompare(formatTimeFromDate(new Date(b.startTime as any))))
  
  return incompleteBlocks.find(block => {
    const blockStartTime = formatTimeFromDate(new Date(block.startTime as any))
    return blockStartTime >= currentTime
  }) || incompleteBlocks[0]
}

function getTimeUntilBlock(blockStartTime: string): string {
  const now = new Date()
  const currentTime = now.getHours() * 60 + now.getMinutes()
  const [hours, minutes] = blockStartTime.split(':').map(Number)
  const blockTime = hours * 60 + minutes
  
  let diff = blockTime - currentTime
  if (diff < 0) {diff += 24 * 60} // Next day
  
  const diffHours = Math.floor(diff / 60)
  const diffMinutes = diff % 60
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes}m`
}

const getCurrentTime = () => {
  const now = new Date()
  return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
}

const isTimeBlockActive = (startTime: string, endTime: string) => {
  const currentTime = getCurrentTime()
  return currentTime >= startTime && currentTime <= endTime
}

export function ScheduleOverview() {
  const today = new Date().toISOString().split('T')[0]
  const {
    data: timeBlocksResponse,
    isLoading,
    error,
  } = useTimeBlocks(today)

  const queryClient = useQueryClient()
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
  const completedCount = timeBlocks.filter(block => block.completed).length
  const totalCount = timeBlocks.length
  const adherenceRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleMarkComplete = async (blockId: string) => {
    try {
      await updateTimeBlockMutation.mutateAsync({
        id: blockId,
        data: { completed: true },
      })
      toast.success('Time block marked as complete!')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to update time block: ${message}`)
    }
  }

  const nextBlock = timeBlocks.length > 0 ? findNextIncompleteTimeBlock(timeBlocks) : null

  if (isLoading) {
    return <ScheduleOverviewSkeleton />
  }

  if (error) {
    return <ScheduleOverviewError error={error.message} />
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Today&apos;s Schedule</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className="text-2xl font-bold text-primary">
              {Math.round(adherenceRate)}%
            </div>
            <div className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} completed
            </div>
            <Progress value={adherenceRate} className="w-20 h-1" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {timeBlocks.map((timeBlock: UITimeBlock) => {
            const categoryData = TIME_BLOCK_CATEGORIES[timeBlock.category as TimeBlockCategory] || {
              icon: '📅',
              color: '#6b7280',
              label: 'Unknown',
            }
            const startTime = formatTimeFromDate(new Date(timeBlock.startTime as string))
            const endTime = formatTimeFromDate(new Date(timeBlock.endTime as string))
            const isActive = isTimeBlockActive(startTime, endTime)
            
            return (
              <div
                key={timeBlock.id as string}
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all ${
                  isActive 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : timeBlock.completed 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-border bg-card hover:bg-muted/30'
                }`}
              >
                {/* Time */}
                <div className="text-sm font-mono text-muted-foreground min-w-[80px]">
                  {startTime} - {endTime}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {timeBlock.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : isActive ? (
                    <Play className="h-5 w-5 text-primary animate-pulse" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Category Icon */}
                <div className="flex-shrink-0">
                  <span className="text-lg">{categoryData.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium truncate">{timeBlock.title as string}</span>
                    <Badge 
                      variant="outline"
                      className="text-xs"
                      style={{ 
                        backgroundColor: `${categoryData.color}10`, 
                        borderColor: `${categoryData.color}30`,
                        color: categoryData.color 
                      }}
                    >
                      {categoryData.label}
                    </Badge>
                    {timeBlock.pomodoroCount && (
                      <Badge variant="secondary" className="text-xs">
                        🍅 {timeBlock.pomodoroCount as number}
                      </Badge>
                    )}
                    {isActive && (
                      <Badge variant="default" className="text-xs animate-pulse">
                        LIVE
                      </Badge>
                    )}
                  </div>
                  {timeBlock.notes && (
                    <div className="text-sm text-muted-foreground mt-1 truncate">
                      {timeBlock.notes as string}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  {isActive && !timeBlock.completed && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleMarkComplete(timeBlock.id as string)}
                      disabled={updateTimeBlockMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Schedule Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {nextBlock ? (
              <>Next: <span className="font-medium">{nextBlock.title as string}</span> in {getTimeUntilBlock(formatTimeFromDate(new Date(nextBlock.startTime as string)))}</>
            ) : (
              "All tasks completed!"
            )}
          </div>
          <div className="space-x-2">
            <Link href="/calendar">
              <Button variant="outline" size="sm">
                Edit Schedule
              </Button>
            </Link>
            {nextBlock && (
              <Button 
                size="sm"
                onClick={() => handleMarkComplete(nextBlock.id as string)}
                disabled={updateTimeBlockMutation.isPending}
              >
                Mark Current Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton component
function ScheduleOverviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-1 w-20" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center space-x-4 p-4 rounded-lg border"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="flex space-x-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <Skeleton className="h-4 w-40" />
          <div className="space-x-2 flex">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Error component
function ScheduleOverviewError({ error }: { error: string }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>Error Loading Schedule</span>
        </CardTitle>
        <CardDescription>
          Unable to load today&apos;s schedule
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground mb-4">
            {error}
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}