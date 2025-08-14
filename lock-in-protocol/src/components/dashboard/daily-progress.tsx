'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Flame, Target, Zap, Droplet } from 'lucide-react'

// Mock data - this would come from API/database in real implementation
const mockDailyMetrics = {
  scheduleAdherence: 85,
  workoutCompleted: true,
  deepWorkHours: 4.2,
  targetDeepWorkHours: 6.0,
  pomodoroCount: 8,
  targetPomodoroCount: 12,
  hydrationLevel: 1.8, // liters
  targetHydrationLevel: 3.0,
  energyLevel: 8, // 1-10
  stressLevel: 3, // 1-10
}

const progressMetrics = [
  {
    id: 'schedule',
    label: 'Schedule Adherence',
    value: mockDailyMetrics.scheduleAdherence,
    target: 100,
    icon: Clock,
    color: 'bg-blue-500',
    unit: '%',
    description: 'Time blocks completed on time',
  },
  {
    id: 'deepwork',
    label: 'Deep Work',
    value: (mockDailyMetrics.deepWorkHours / mockDailyMetrics.targetDeepWorkHours) * 100,
    target: 100,
    icon: Target,
    color: 'bg-purple-500',
    unit: `${mockDailyMetrics.deepWorkHours}h / ${mockDailyMetrics.targetDeepWorkHours}h`,
    description: 'Focused work sessions',
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro Sessions',
    value: (mockDailyMetrics.pomodoroCount / mockDailyMetrics.targetPomodoroCount) * 100,
    target: 100,
    icon: Flame,
    color: 'bg-orange-500',
    unit: `${mockDailyMetrics.pomodoroCount} / ${mockDailyMetrics.targetPomodoroCount}`,
    description: '25-minute focus blocks',
  },
  {
    id: 'hydration',
    label: 'Hydration',
    value: (mockDailyMetrics.hydrationLevel / mockDailyMetrics.targetHydrationLevel) * 100,
    target: 100,
    icon: Droplet,
    color: 'bg-cyan-500',
    unit: `${mockDailyMetrics.hydrationLevel}L / ${mockDailyMetrics.targetHydrationLevel}L`,
    description: 'Water intake today',
  },
]

const wellnessMetrics = [
  {
    label: 'Energy Level',
    value: mockDailyMetrics.energyLevel,
    max: 10,
    icon: Zap,
    color: 'text-yellow-500',
    status: mockDailyMetrics.energyLevel >= 7 ? 'good' : mockDailyMetrics.energyLevel >= 5 ? 'okay' : 'low',
  },
  {
    label: 'Stress Level',
    value: mockDailyMetrics.stressLevel,
    max: 10,
    icon: Target,
    color: 'text-red-500',
    status: mockDailyMetrics.stressLevel <= 3 ? 'good' : mockDailyMetrics.stressLevel <= 6 ? 'okay' : 'high',
    inverted: true, // Lower is better for stress
  },
]

export function DailyProgress() {
  const getStatusColor = (status: string, inverted = false) => {
    if (inverted) {
      return status === 'good' ? 'text-green-600' : status === 'okay' ? 'text-yellow-600' : 'text-red-600'
    }
    return status === 'good' ? 'text-green-600' : status === 'okay' ? 'text-yellow-600' : 'text-red-600'
  }

  const overallProgress = progressMetrics.reduce((acc, metric) => acc + metric.value, 0) / progressMetrics.length

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
            <CheckCircle className={`h-6 w-6 ${mockDailyMetrics.workoutCompleted ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <div className="font-medium">Workout</div>
              <div className="text-sm text-muted-foreground">
                {mockDailyMetrics.workoutCompleted ? 'Completed' : 'Pending'}
              </div>
            </div>
          </div>
          <Badge variant={mockDailyMetrics.workoutCompleted ? "default" : "secondary"}>
            {mockDailyMetrics.workoutCompleted ? 'Done ✓' : 'Pending'}
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