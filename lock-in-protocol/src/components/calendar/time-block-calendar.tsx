'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit, 
  Clock,
  CheckCircle,
  Play
} from 'lucide-react'
import { TIME_BLOCK_CATEGORIES } from '@/lib/constants'
import { TimeBlockCategory } from '@prisma/client'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'

// Mock schedule data
const mockWeeklySchedule = {
  '2024-01-08': [ // Monday
    {
      id: '1',
      title: 'Morning HIIT',
      category: 'HIIT_MORNING' as TimeBlockCategory,
      startTime: '05:25',
      endTime: '05:40',
      completed: true,
    },
    {
      id: '2',
      title: 'DSA Deep Work',
      category: 'DEEP_WORK_DSA' as TimeBlockCategory,
      startTime: '09:00',
      endTime: '12:00',
      completed: false,
      isActive: true,
    },
    {
      id: '3',
      title: 'Upper Body Workout',
      category: 'WORKOUT_UPPER_1' as TimeBlockCategory,
      startTime: '16:30',
      endTime: '18:00',
      completed: false,
    },
  ],
  // Add more days as needed
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export function TimeBlockCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date()))
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<string | null>(null)

  const formatDateKey = (date: Date) => format(date, 'yyyy-MM-dd')

  // const getTodaySchedule = () => {
  //   const dateKey = formatDateKey(selectedDate)
  //   return mockWeeklySchedule[dateKey as keyof typeof mockWeeklySchedule] || []
  // }

  const getWeekDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeek, i))
    }
    return days
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentWeek(subWeeks(currentWeek, 1))
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1))
    }
  }

  const isTimeSlotOccupied = (time: string, date: Date) => {
    const dateKey = formatDateKey(date)
    const daySchedule = mockWeeklySchedule[dateKey as keyof typeof mockWeeklySchedule] || []
    
    return daySchedule.find(block => {
      const blockStartHour = parseInt(block.startTime.split(':')[0])
      const slotHour = parseInt(time.split(':')[0])
      const blockEndHour = parseInt(block.endTime.split(':')[0])
      
      return slotHour >= blockStartHour && slotHour < blockEndHour
    })
  }

  const renderDayView = () => (
    <div className="space-y-1">
      {timeSlots.map(time => {
        const occupiedBlock = isTimeSlotOccupied(time, selectedDate)
        const categoryData = occupiedBlock ? TIME_BLOCK_CATEGORIES[occupiedBlock.category] : null
        
        return (
          <div
            key={time}
            className={`flex items-center p-2 rounded-md border transition-all hover:bg-muted/50 cursor-pointer ${
              occupiedBlock 
                ? occupiedBlock.completed
                  ? 'bg-green-50 border-green-200'
                  : occupiedBlock.isActive
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-muted'
                : 'border-transparent'
            }`}
            onClick={() => setSelectedTimeBlock(occupiedBlock?.id || null)}
          >
            <div className="w-16 text-sm text-muted-foreground font-mono">
              {time}
            </div>
            {occupiedBlock ? (
              <div className="flex items-center space-x-2 flex-1">
                <span className="text-sm">{categoryData?.icon}</span>
                <span className="text-sm font-medium">{occupiedBlock.title}</span>
                <Badge 
                  variant="outline" 
                  className="text-xs ml-auto"
                  style={{ 
                    backgroundColor: `${categoryData?.color}10`, 
                    borderColor: `${categoryData?.color}30`,
                    color: categoryData?.color 
                  }}
                >
                  {categoryData?.label}
                </Badge>
                {occupiedBlock.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : occupiedBlock.isActive ? (
                  <Play className="h-4 w-4 text-primary animate-pulse" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ) : (
              <div className="flex-1 text-sm text-muted-foreground hover:text-foreground">
                Click to add time block
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const renderWeekView = () => {
    const weekDays = getWeekDays()
    
    return (
      <div className="grid grid-cols-8 gap-1">
        {/* Time column header */}
        <div className="p-2">
          <div className="text-sm font-medium text-muted-foreground">Time</div>
        </div>
        
        {/* Day headers */}
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 text-center">
            <div className="text-sm font-medium">
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg ${
              format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                ? 'font-bold text-primary'
                : ''
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}

        {/* Time slots and schedule blocks */}
        {timeSlots.slice(5, 24).map(time => (
          <div key={time} className="contents">
            {/* Time label */}
            <div className="p-2 text-sm text-muted-foreground font-mono border-r">
              {time}
            </div>
            
            {/* Day columns */}
            {weekDays.map(day => {
              const occupiedBlock = isTimeSlotOccupied(time, day)
              const categoryData = occupiedBlock ? TIME_BLOCK_CATEGORIES[occupiedBlock.category] : null
              
              return (
                <div
                  key={`${day.toISOString()}-${time}`}
                  className={`p-1 min-h-[50px] border-b border-r cursor-pointer hover:bg-muted/30 ${
                    occupiedBlock
                      ? 'bg-muted/20'
                      : 'hover:bg-muted/10'
                  }`}
                  onClick={() => setSelectedTimeBlock(occupiedBlock?.id || null)}
                >
                  {occupiedBlock && (
                    <div
                      className="p-1 rounded text-xs text-white text-center"
                      style={{ backgroundColor: categoryData?.color }}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>{categoryData?.icon}</span>
                        <span className="truncate">{occupiedBlock.title}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Schedule Calendar</CardTitle>
            <CardDescription>
              Plan and manage your time blocks
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Block
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Template
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
  <Tabs value={view} onValueChange={(value) => setView(value as 'day' | 'week' | 'month')} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => view === 'week' ? navigateWeek('prev') : setSelectedDate(subDays(selectedDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-sm font-medium min-w-[200px] text-center">
                {view === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {view === 'week' && `${format(currentWeek, 'MMM d')} - ${format(addDays(currentWeek, 6), 'MMM d, yyyy')}`}
                {view === 'month' && format(selectedDate, 'MMMM yyyy')}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => view === 'week' ? navigateWeek('next') : setSelectedDate(addDays(selectedDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="day" className="space-y-4">
            {renderDayView()}
          </TabsContent>

          <TabsContent value="week" className="space-y-4">
            <div className="overflow-auto">
              {renderWeekView()}
            </div>
          </TabsContent>

          <TabsContent value="month" className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </TabsContent>
          {selectedTimeBlock && (
            <div className="text-xs text-muted-foreground">Selected block ID: {selectedTimeBlock}</div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}