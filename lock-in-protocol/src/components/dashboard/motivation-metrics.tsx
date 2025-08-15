'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Flame, 
  Target, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Zap,
  Award,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useAchievements, useHabits, useWeeklyAnalytics } from '@/hooks/use-dashboard'
import type { Achievement, Habit, WeeklyAnalytics } from '@/types/api'

// Helper functions to process API data
function createStreakItems(habits: Habit[], weeklyData: WeeklyAnalytics | null) {
  const streakMapping: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; emoji: string }> = {
    'lockInProtocol': {
      label: 'Lock-In Days',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      emoji: '🔥',
    },
    'workoutConsistency': {
      label: 'Workout Streak',
      icon: Target,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      emoji: '💪',
    },
    'earlyRise': {
      label: 'Early Rise',
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      emoji: '🌅',
    },
    'deepWorkDaily': {
      label: 'Deep Work',
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      emoji: '⚡',
    },
  }

  const streakItems = []
  
  // Lock-In Protocol streak from schedule adherence
  if (weeklyData?.streaks?.scheduleStreak !== undefined) {
    streakItems.push({
      key: 'lockInProtocol',
      value: weeklyData.streaks.scheduleStreak,
      ...streakMapping.lockInProtocol
    })
  }

  // Workout streak
  if (weeklyData?.streaks?.workoutStreak !== undefined) {
    streakItems.push({
      key: 'workoutConsistency',
      value: weeklyData.streaks.workoutStreak,
      ...streakMapping.workoutConsistency
    })
  }

  // Deep work streak (pomodoro streak)
  if (weeklyData?.streaks?.pomodoroStreak !== undefined) {
    streakItems.push({
      key: 'deepWorkDaily',
      value: weeklyData.streaks.pomodoroStreak,
      ...streakMapping.deepWorkDaily
    })
  }

  // Add habit-based streaks
  habits.forEach(habit => {
    if (habit.title.toLowerCase().includes('early') || habit.title.toLowerCase().includes('morning')) {
      streakItems.push({
        key: 'earlyRise',
        value: habit.currentStreak,
        ...streakMapping.earlyRise
      })
    }
  })

  return streakItems.slice(0, 4) // Limit to 4 items
}

function createWeeklyInsight(weeklyData: WeeklyAnalytics | null) {
  if (!weeklyData) {
    return {
      message: "Loading insights...",
      detail: "Analyzing your weekly performance.",
      trend: "stable" as const,
    }
  }

  const adherenceRate = weeklyData.schedule?.adherenceRate || 0
  let message = "Keep going! 💪"
  let detail = `${Math.round(adherenceRate)}% schedule adherence this week.`
  let trend: "improving" | "stable" | "declining" = "stable"

  if (adherenceRate >= 90) {
    message = "You're crushing it! 📈"
    detail = `${Math.round(adherenceRate)}% schedule adherence - excellent consistency!`
    trend = "improving"
  } else if (adherenceRate >= 75) {
    message = "Great progress! 🎯"
    detail = `${Math.round(adherenceRate)}% schedule adherence - keep it up!`
    trend = "improving"
  } else if (adherenceRate >= 50) {
    message = "Room for improvement 📊"
    detail = `${Math.round(adherenceRate)}% schedule adherence - you can do better!`
    trend = "stable"
  } else {
    message = "Let's refocus! 🎯"
    detail = `${Math.round(adherenceRate)}% schedule adherence - time to lock in!`
    trend = "declining"
  }

  return { message, detail, trend }
}

export function MotivationMetrics() {
  const {
    data: achievementsResponse,
    isLoading: achievementsLoading,
    error: achievementsError,
  } = useAchievements()

  const {
    data: habitsResponse,
    isLoading: habitsLoading,
    error: habitsError,
  } = useHabits()

  const {
    data: weeklyResponse,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useWeeklyAnalytics()

  const isLoading = achievementsLoading || habitsLoading || weeklyLoading
  const error = achievementsError || habitsError || weeklyError

  if (isLoading) {
    return <MotivationMetricsSkeleton />
  }

  if (error) {
    return <MotivationMetricsError error={error.message} />
  }

  const achievements = (achievementsResponse?.success ? achievementsResponse.data : []) as Achievement[]
  const habits = (habitsResponse?.success ? habitsResponse.data : []) as Habit[]
  const weeklyData = (weeklyResponse?.success ? weeklyResponse.data : null) as WeeklyAnalytics | null

  const streakItems = createStreakItems(habits, weeklyData)
  const weeklyInsight = createWeeklyInsight(weeklyData)
  const weeklyProgress = {
    current: Math.round(weeklyData?.schedule?.adherenceRate || 0),
    target: 85, // Target adherence rate
    daysCompleted: Math.ceil((weeklyData?.schedule?.completedTimeBlocks || 0) / (weeklyData?.schedule?.totalTimeBlocks || 1) * 7),
    totalDays: 7,
  }

  return (
    <div className="space-y-6">
      {/* Current Streaks */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Current Streaks</CardTitle>
          </div>
          <CardDescription>Keep the momentum going!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {streakItems.map((streak) => (
              <div
                key={streak.key}
                className={`p-3 rounded-lg ${streak.bgColor} border border-border/50`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{streak.emoji}</span>
                    <div>
                      <div className="text-sm font-medium">{streak.label}</div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${streak.color}`}>
                    {streak.value}
                  </div>
                </div>
              </div>
            ))}
            {streakItems.length === 0 && (
              <div className="col-span-2 text-center py-4">
                <Flame className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Start building your streaks by completing daily activities!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">This Week</CardTitle>
            </div>
            <Badge variant="secondary">
              {weeklyProgress.daysCompleted}/{weeklyProgress.totalDays} days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Weekly Target</span>
              <span className="font-medium">
                {weeklyProgress.current}% / {weeklyProgress.target}%
              </span>
            </div>
            <Progress 
              value={weeklyProgress.current} 
              className="h-2"
            />
          </div>
          
          <div className={`flex items-center space-x-2 p-3 rounded-lg border ${
            weeklyInsight.trend === 'improving' ? 'bg-green-50 border-green-200' :
            weeklyInsight.trend === 'declining' ? 'bg-red-50 border-red-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <TrendingUp className={`h-4 w-4 ${
              weeklyInsight.trend === 'improving' ? 'text-green-600' :
              weeklyInsight.trend === 'declining' ? 'text-red-600' :
              'text-yellow-600'
            }`} />
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                weeklyInsight.trend === 'improving' ? 'text-green-800' :
                weeklyInsight.trend === 'declining' ? 'text-red-800' :
                'text-yellow-800'
              }`}>
                {weeklyInsight.message}
              </div>
              <div className={`text-xs ${
                weeklyInsight.trend === 'improving' ? 'text-green-600' :
                weeklyInsight.trend === 'declining' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {weeklyInsight.detail}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Achievements</CardTitle>
          </div>
          <CardDescription>Unlock badges as you progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements.slice(0, 3).map((achievement, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  achievement.unlocked
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                    {achievement.badge || '🏆'}
                  </span>
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${
                      achievement.unlocked ? 'text-yellow-800' : 'text-muted-foreground'
                    }`}>
                      {achievement.title}
                      {achievement.unlocked && <Award className="inline h-3 w-3 ml-1 text-yellow-600" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {achievement.description}
                    </div>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-1" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {achievement.progress}% complete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {achievements.length === 0 && (
              <div className="text-center py-4">
                <Trophy className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No achievements unlocked yet. Keep working towards your goals!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading skeleton component
function MotivationMetricsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current Streaks Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                    <Skeleton className="h-1 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error component
function MotivationMetricsError({ error }: { error: string }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>Error Loading Motivation Data</span>
        </CardTitle>
        <CardDescription>
          Unable to load your motivation metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </CardContent>
    </Card>
  )
}