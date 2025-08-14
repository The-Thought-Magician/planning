'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, Edit, MoreHorizontal, Play } from 'lucide-react'
import { TIME_BLOCK_CATEGORIES } from '@/lib/constants'
import { TimeBlockCategory } from '@prisma/client'
import Link from 'next/link'

// Mock schedule data - this would come from API in real implementation
const mockScheduleData = [
  {
    id: '1',
    title: 'Morning HIIT',
    category: 'HIIT_MORNING' as TimeBlockCategory,
    startTime: '05:25',
    endTime: '05:40',
    completed: true,
    notes: 'Great energy boost!',
  },
  {
    id: '2',
    title: 'Morning Mobility',
    category: 'MOBILITY_MORNING' as TimeBlockCategory,
    startTime: '05:45',
    endTime: '05:55',
    completed: true,
  },
  {
    id: '3',
    title: 'Buffer Time',
    category: 'BUFFER_TIME' as TimeBlockCategory,
    startTime: '06:00',
    endTime: '08:00',
    completed: true,
    notes: 'Used for shower and prep',
  },
  {
    id: '4',
    title: 'Breakfast',
    category: 'MEAL_BREAKFAST' as TimeBlockCategory,
    startTime: '08:00',
    endTime: '08:30',
    completed: true,
  },
  {
    id: '5',
    title: 'DSA Deep Work',
    category: 'DEEP_WORK_DSA' as TimeBlockCategory,
    startTime: '09:00',
    endTime: '12:00',
    completed: false, // Currently in progress
    isActive: true,
    pomodoroCount: 2,
  },
  {
    id: '6',
    title: 'Lunch Break',
    category: 'MEAL_LUNCH' as TimeBlockCategory,
    startTime: '13:00',
    endTime: '14:00',
    completed: false,
  },
  {
    id: '7',
    title: 'ME61011 Class',
    category: 'CLASS_ME61011' as TimeBlockCategory,
    startTime: '14:30',
    endTime: '16:00',
    completed: false,
  },
  {
    id: '8',
    title: 'Upper Body Workout',
    category: 'WORKOUT_UPPER_1' as TimeBlockCategory,
    startTime: '16:30',
    endTime: '18:00',
    completed: false,
  },
  {
    id: '9',
    title: 'Buffer Time',
    category: 'BUFFER_TIME' as TimeBlockCategory,
    startTime: '18:30',
    endTime: '20:00',
    completed: false,
  },
  {
    id: '10',
    title: 'Dinner',
    category: 'MEAL_DINNER' as TimeBlockCategory,
    startTime: '20:00',
    endTime: '20:45',
    completed: false,
  },
]

const getCurrentTime = () => {
  const now = new Date()
  return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')
}

const isTimeBlockActive = (startTime: string, endTime: string) => {
  const currentTime = getCurrentTime()
  return currentTime >= startTime && currentTime <= endTime
}

export function ScheduleOverview() {
  const completedCount = mockScheduleData.filter(block => block.completed).length
  const totalCount = mockScheduleData.length
  const adherenceRate = (completedCount / totalCount) * 100

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
          {mockScheduleData.map((timeBlock) => {
            const categoryData = TIME_BLOCK_CATEGORIES[timeBlock.category]
            const isActive = timeBlock.isActive || isTimeBlockActive(timeBlock.startTime, timeBlock.endTime)
            
            return (
              <div
                key={timeBlock.id}
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
                  {timeBlock.startTime} - {timeBlock.endTime}
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
                    <span className="font-medium truncate">{timeBlock.title}</span>
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
                        🍅 {timeBlock.pomodoroCount}
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
                      {timeBlock.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1">
                  {isActive && !timeBlock.completed && (
                    <Button size="sm" variant="outline">
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
            Next: <span className="font-medium">Lunch Break</span> in 2h 15m
          </div>
          <div className="space-x-2">
            <Link href="/calendar">
              <Button variant="outline" size="sm">
                Edit Schedule
              </Button>
            </Link>
            <Button size="sm">
              Mark Current Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}