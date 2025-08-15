'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle, Clock, Flame, Target, Zap, Droplet, AlertCircle } from 'lucide-react'
import { useDailyMetrics, useDashboardData } from '@/hooks/use-dashboard'
import { toast } from 'sonner'

// Helper functions
function createProgressMetrics(metrics: any, dashboardData: any) {
  const targetDeepWorkHours = 6.0
  const targetPomodoroCount = 12
  const targetHydrationLevel = 3.0

  const scheduleAdherence = typeof metrics?.scheduleAdherence === 'number' ? metrics.scheduleAdherence : 0
  const deepWorkHours = typeof metrics?.deepWorkHours === 'number' ? metrics.deepWorkHours : 0
  const pomodoroCount = typeof metrics?.pomodoroCount === 'number' ? metrics.pomodoroCount : 0
  const hydration = typeof dashboardData?.today?.hydration === 'number' ? dashboardData.today.hydration : 0

  return [
    {
      id: 'schedule',
      label: 'Schedule Adherence',
      value: scheduleAdherence,
      target: 100,
      icon: Clock,
      color: 'bg-blue-500',
      unit: '%',
      description: 'Time blocks completed on time',
    },
    {
      id: 'deepwork',
      label: 'Deep Work',
      value: deepWorkHours ? (deepWorkHours / targetDeepWorkHours) * 100 : 0,
      target: 100,
      icon: Target,
      color: 'bg-purple-500',
      unit: `${deepWorkHours}h / ${targetDeepWorkHours}h`,
      description: 'Focused work sessions',
    },
    {
      id: 'pomodoro',
      label: 'Pomodoro Sessions',
      value: pomodoroCount ? (pomodoroCount / targetPomodoroCount) * 100 : 0,
      target: 100,
      icon: Flame,
      color: 'bg-orange-500',
      unit: `${pomodoroCount} / ${targetPomodoroCount}`,
      description: '25-minute focus blocks',
    },
    {
      id: 'hydration',
      label: 'Hydration',
      value: hydration ? (hydration / targetHydrationLevel) * 100 : 0,
      target: 100,
      icon: Droplet,
      color: 'bg-cyan-500',
      unit: `${hydration}L / ${targetHydrationLevel}L`,
      description: 'Water intake today',
    },
  ]
}

function createWellnessMetrics(metrics: any) {
  const energyLevel = typeof metrics?.energyLevel === 'number' ? metrics.energyLevel : 0
  const stressLevel = typeof metrics?.stressLevel === 'number' ? metrics.stressLevel : 0
  return [
    {
      label: 'Energy Level',
      value: energyLevel,
      max: 10,
      icon: Zap,
      color: 'text-yellow-500',
      status: energyLevel >= 7 ? 'good' : energyLevel >= 5 ? 'okay' : 'low',
    },
    {
      label: 'Stress Level',
      value: stressLevel,
      max: 10,
      icon: Target,
      color: 'text-red-500',
      status: stressLevel <= 3 ? 'good' : stressLevel <= 6 ? 'okay' : 'high',
      inverted: true, // Lower is better for stress
    },
  ]
}

export function DailyProgress() {
  const {
    data: metricsResponse,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDailyMetrics()

  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardData()

  const isLoading = metricsLoading || dashboardLoading
  const error = metricsError || dashboardError

  // Show error toast if there's an error
  if (error && !isLoading) {
    toast.error(`Failed to load progress data: ${error.message}`)
  }

  const todayMetrics = metricsResponse?.success ? (metricsResponse.data as any[])?.[0] : null
  const dashboardData = dashboardResponse?.success ? (dashboardResponse.data as any) : null
  
  const progressMetrics = createProgressMetrics(todayMetrics, dashboardData)
  const wellnessMetrics = createWellnessMetrics(todayMetrics)

  const getStatusColor = (status: string, inverted = false) => {
    if (inverted) {
      return status === 'good' ? 'text-green-600' : status === 'okay' ? 'text-yellow-600' : 'text-red-600'
    }
    return status === 'good' ? 'text-green-600' : status === 'okay' ? 'text-yellow-600' : 'text-red-600'
  }

  const overallProgress = progressMetrics.reduce((acc, metric) => acc + metric.value, 0) / progressMetrics.length

  if (isLoading) {
    return <DailyProgressSkeleton />
  }

  if (error && !todayMetrics && !dashboardData) {
    return <DailyProgressError error={error.message} />
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Today&apos;s Progress</CardTitle>
            <CardDescription>
              Track your Lock-In Protocol metrics for {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{Math.round(overallProgress)}%</div>
            <div className="text-sm text-muted-foreground">Overall</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workout Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center space-x-3">
            <CheckCircle className={`h-6 w-6 ${todayMetrics?.workoutCompleted ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <div className="font-medium">Workout</div>
              <div className="text-sm text-muted-foreground">
                {todayMetrics?.workoutCompleted ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>
          <Badge variant={todayMetrics?.workoutCompleted ? "default" : "secondary"}>
            {todayMetrics?.workoutCompleted ? 'Done ✓' : 'Pending'}
          </Badge>
        </div>

        {/* Progress Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {progressMetrics.map((metric) => {
            const IconComponent = metric.icon
            return (
              <div key={metric.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{metric.unit}</span>
                </div>
                <div className="space-y-1">
                  <Progress value={metric.value} className="h-2" />
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Wellness Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Wellness Check</h4>
          <div className="grid grid-cols-2 gap-4">
            {wellnessMetrics.map((metric) => {
              const IconComponent = metric.icon
              return (
                <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm">{metric.label}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${getStatusColor(metric.status, metric.inverted)}`}>
                      {metric.value}/{metric.max}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading skeleton component
function DailyProgressSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workout Status Skeleton */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Progress Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Wellness Metrics Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Error component
function DailyProgressError({ error }: { error: string }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>Error Loading Progress</span>
        </CardTitle>
        <CardDescription>
          Unable to load today&apos;s progress data
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