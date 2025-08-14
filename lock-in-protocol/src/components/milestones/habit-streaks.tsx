'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Calendar, Target, Award } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface HabitStreak {
  id: string
  habitName: string
  category: string
  currentStreak: number
  bestStreak: number
  lastCompleted: Date
  isActive: boolean
  weeklyTarget: number
  weeklyProgress: number
}

const HABIT_DATA: HabitStreak[] = [
  {
    id: '1',
    habitName: 'Morning Workout',
    category: 'Fitness',
    currentStreak: 12,
    bestStreak: 18,
    lastCompleted: new Date(),
    isActive: true,
    weeklyTarget: 4,
    weeklyProgress: 3
  },
  {
    id: '2', 
    habitName: 'Daily Coding Practice',
    category: 'Professional',
    currentStreak: 25,
    bestStreak: 30,
    lastCompleted: new Date(),
    isActive: true,
    weeklyTarget: 7,
    weeklyProgress: 6
  },
  {
    id: '3',
    habitName: 'Proper Sleep Schedule',
    category: 'Health',
    currentStreak: 8,
    bestStreak: 15,
    lastCompleted: subDays(new Date(), 1),
    isActive: true,
    weeklyTarget: 7,
    weeklyProgress: 5
  },
  {
    id: '4',
    habitName: 'Reading Academic Papers',
    category: 'Academic',
    currentStreak: 5,
    bestStreak: 12,
    lastCompleted: new Date(),
    isActive: true,
    weeklyTarget: 3,
    weeklyProgress: 2
  }
]

export function HabitStreaks() {
  const [habits] = useState<HabitStreak[]>(HABIT_DATA)

  const getCategoryColor = (category: string) => {
    const colors = {
      'Fitness': 'bg-red-500',
      'Professional': 'bg-blue-500', 
      'Health': 'bg-green-500',
      'Academic': 'bg-purple-500'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-500'
  }

  const getStreakStatus = (habit: HabitStreak) => {
    const today = new Date()
    const lastCompleted = new Date(habit.lastCompleted)
    const daysDiff = Math.floor((today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) return { status: 'completed', color: 'text-green-600', message: 'Completed today' }
    if (daysDiff === 1) return { status: 'due', color: 'text-yellow-600', message: 'Due today' }
    if (daysDiff > 1) return { status: 'overdue', color: 'text-red-600', message: `${daysDiff} days overdue` }
    return { status: 'unknown', color: 'text-gray-600', message: 'Unknown status' }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habits.filter(h => h.isActive).length}</div>
            <p className="text-xs text-muted-foreground">being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...habits.map(h => h.currentStreak))}
            </div>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {habits.reduce((sum, h) => sum + h.weeklyProgress, 0)} / {habits.reduce((sum, h) => sum + h.weeklyTarget, 0)}
            </div>
            <Progress 
              value={(habits.reduce((sum, h) => sum + h.weeklyProgress, 0) / habits.reduce((sum, h) => sum + h.weeklyTarget, 0)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfect Days</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Habit Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {habits.map(habit => {
          const status = getStreakStatus(habit)
          const weeklyPercentage = (habit.weeklyProgress / habit.weeklyTarget) * 100
          
          return (
            <Card key={habit.id} className={`border-l-4 border-l-${getCategoryColor(habit.category).replace('bg-', '')}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{habit.habitName}</CardTitle>
                    <CardDescription>{habit.category} habit</CardDescription>
                  </div>
                  <Badge className={getCategoryColor(habit.category)}>{habit.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Current Streak</p>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-xl font-bold">{habit.currentStreak}</span>
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Best Streak</p>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span className="text-xl font-bold">{habit.bestStreak}</span>
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly Progress</span>
                    <span>{habit.weeklyProgress}/{habit.weeklyTarget}</span>
                  </div>
                  <Progress value={weeklyPercentage} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Last completed</p>
                    <p className="text-sm font-medium">
                      {format(habit.lastCompleted, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={status.color}>
                      {status.message}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}