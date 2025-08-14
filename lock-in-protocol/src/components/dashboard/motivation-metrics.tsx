'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Flame, 
  Target, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Zap,
  Award,
  Clock
} from 'lucide-react'

// Mock data - this would come from API/database in real implementation
const motivationData = {
  streaks: {
    lockInProtocol: 12,
    workoutConsistency: 6,
    earlyRise: 5,
    deepWorkDaily: 8,
  },
  weeklyProgress: {
    current: 85,
    target: 90,
    daysCompleted: 5,
    totalDays: 7,
  },
  achievements: [
    {
      title: 'Week Warrior',
      description: '7 days of schedule adherence',
      icon: '🏆',
      unlocked: true,
      progress: 100,
    },
    {
      title: 'Focus Master',
      description: 'Complete 50 pomodoros',
      icon: '🎯',
      unlocked: false,
      progress: 76, // 38/50
    },
    {
      title: 'Iron Will',
      description: '30-day workout streak',
      icon: '💪',
      unlocked: false,
      progress: 20, // 6/30
    },
  ],
  weeklyInsight: {
    message: "You're crushing it! 📈",
    detail: "85% schedule adherence - 5% above your average.",
    trend: "improving" as const,
  },
}

const streakItems = [
  {
    key: 'lockInProtocol',
    label: 'Lock-In Days',
    value: motivationData.streaks.lockInProtocol,
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    emoji: '🔥',
  },
  {
    key: 'workoutConsistency',
    label: 'Workout Streak',
    value: motivationData.streaks.workoutConsistency,
    icon: Target,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    emoji: '💪',
  },
  {
    key: 'earlyRise',
    label: 'Early Rise',
    value: motivationData.streaks.earlyRise,
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    emoji: '🌅',
  },
  {
    key: 'deepWorkDaily',
    label: 'Deep Work',
    value: motivationData.streaks.deepWorkDaily,
    icon: Zap,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    emoji: '⚡',
  },
]

export function MotivationMetrics() {
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
              {motivationData.weeklyProgress.daysCompleted}/{motivationData.weeklyProgress.totalDays} days
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Weekly Target</span>
              <span className="font-medium">
                {motivationData.weeklyProgress.current}% / {motivationData.weeklyProgress.target}%
              </span>
            </div>
            <Progress 
              value={motivationData.weeklyProgress.current} 
              className="h-2"
            />
          </div>
          
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 border border-green-200">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <div className="flex-1">
              <div className="text-sm font-medium text-green-800">
                {motivationData.weeklyInsight.message}
              </div>
              <div className="text-xs text-green-600">
                {motivationData.weeklyInsight.detail}
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
            {motivationData.achievements.map((achievement, index) => (
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
                    {achievement.icon}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}