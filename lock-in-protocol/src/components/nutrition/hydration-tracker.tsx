'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Droplets, Plus, Minus, Target, Clock, Award, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface HydrationEntry {
  id: string
  amount: number // in ml
  timestamp: Date
  type: 'water' | 'sports_drink' | 'other'
}

interface HydrationGoal {
  dailyTarget: number // liters
  currentIntake: number // ml
  lastIntakeTime?: Date
  streak: number
  reminders: string[]
}

const QUICK_ADD_AMOUNTS = [250, 500, 750, 1000] // ml
const HYDRATION_REMINDERS = [
  '08:00 - Morning hydration boost',
  '10:00 - Mid-morning reminder',
  '12:00 - Pre-lunch hydration',
  '14:00 - Afternoon energy dip prevention',
  '16:00 - Pre-workout preparation',
  '18:00 - Post-workout recovery',
  '20:00 - Evening wind-down'
]

const MILESTONE_BADGES = [
  { threshold: 1000, name: 'Hydration Starter', icon: '💧', color: 'bg-blue-400' },
  { threshold: 2000, name: 'Water Warrior', icon: '🌊', color: 'bg-blue-500' },
  { threshold: 3000, name: 'Hydration Hero', icon: '💪', color: 'bg-blue-600' },
  { threshold: 4000, name: 'H2O Champion', icon: '🏆', color: 'bg-blue-700' }
]

export function HydrationTracker() {
  const [hydrationGoal, setHydrationGoal] = useState<HydrationGoal>({
    dailyTarget: 3000, // 3L default
    currentIntake: 750, // Mock data
    streak: 5,
    reminders: HYDRATION_REMINDERS
  })
  
  const [todayEntries, setTodayEntries] = useState<HydrationEntry[]>([
    {
      id: '1',
      amount: 500,
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      type: 'water'
    },
    {
      id: '2', 
      amount: 250,
      timestamp: new Date(Date.now() - 1800000), // 30 min ago
      type: 'water'
    }
  ])

  const [customAmount, setCustomAmount] = useState<number>(500)

  const addHydration = (amount: number, type: 'water' | 'sports_drink' | 'other' = 'water') => {
    const newEntry: HydrationEntry = {
      id: Date.now().toString(),
      amount,
      timestamp: new Date(),
      type
    }
    
    setTodayEntries(prev => [newEntry, ...prev])
    setHydrationGoal(prev => ({
      ...prev,
      currentIntake: prev.currentIntake + amount,
      lastIntakeTime: new Date()
    }))
    
    toast.success(`Added ${amount}ml to your hydration log!`)
    
    // Check for milestone achievements
    const newTotal = hydrationGoal.currentIntake + amount
    const achievedMilestone = MILESTONE_BADGES.find(
      badge => hydrationGoal.currentIntake < badge.threshold && newTotal >= badge.threshold
    )
    
    if (achievedMilestone) {
      toast.success(`🎉 Achievement unlocked: ${achievedMilestone.name}!`, {
        duration: 5000
      })
    }
  }

  const removeLastEntry = () => {
    if (todayEntries.length === 0) return
    
    const lastEntry = todayEntries[0]
    setTodayEntries(prev => prev.slice(1))
    setHydrationGoal(prev => ({
      ...prev,
      currentIntake: Math.max(0, prev.currentIntake - lastEntry.amount)
    }))
    
    toast.info(`Removed ${lastEntry.amount}ml from your log`)
  }

  const getProgressPercentage = () => {
    return Math.min((hydrationGoal.currentIntake / hydrationGoal.dailyTarget) * 100, 100)
  }

  const getRemainingAmount = () => {
    return Math.max(0, hydrationGoal.dailyTarget - hydrationGoal.currentIntake)
  }

  const getHydrationStatus = () => {
    const percentage = getProgressPercentage()
    if (percentage >= 100) return { status: 'excellent', color: 'text-green-600', message: 'Goal achieved!' }
    if (percentage >= 75) return { status: 'good', color: 'text-blue-600', message: 'Great progress!' }
    if (percentage >= 50) return { status: 'moderate', color: 'text-yellow-600', message: 'Keep going!' }
    return { status: 'low', color: 'text-red-600', message: 'Need more water!' }
  }

  const getTimeUntilNextReminder = () => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    for (const reminder of HYDRATION_REMINDERS) {
      const [time] = reminder.split(' - ')
      const [hour, minute] = time.split(':').map(Number)
      
      if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
        const nextReminderTime = new Date()
        nextReminderTime.setHours(hour, minute, 0, 0)
        const diffMinutes = Math.floor((nextReminderTime.getTime() - now.getTime()) / 60000)
        return { time: time, minutes: diffMinutes }
      }
    }
    
    // Next reminder is tomorrow
    return { time: HYDRATION_REMINDERS[0].split(' - ')[0], minutes: null }
  }

  const getCurrentMilestone = () => {
    return MILESTONE_BADGES
      .filter(badge => hydrationGoal.currentIntake >= badge.threshold)
      .pop()
  }

  const getNextMilestone = () => {
    return MILESTONE_BADGES.find(badge => hydrationGoal.currentIntake < badge.threshold)
  }

  const hydrationStatus = getHydrationStatus()
  const nextReminder = getTimeUntilNextReminder()
  const currentMilestone = getCurrentMilestone()
  const nextMilestone = getNextMilestone()
  // const currentTime = new Date().toTimeString().slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Progress</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(hydrationGoal.currentIntake / 1000).toFixed(1)}L
            </div>
            <Progress value={getProgressPercentage()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(getProgressPercentage())}% of daily goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(getRemainingAmount() / 1000).toFixed(1)}L
            </div>
            <p className={`text-xs ${hydrationStatus.color}`}>
              {hydrationStatus.message}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hydrationGoal.streak}</div>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Reminder</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nextReminder.time}</div>
            <p className="text-xs text-muted-foreground">
              {nextReminder.minutes ? `in ${nextReminder.minutes}min` : 'tomorrow'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hydration Status & Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-500" />
            Hydration Status
          </CardTitle>
          <CardDescription>
            Current: {(hydrationGoal.currentIntake / 1000).toFixed(1)}L / {(hydrationGoal.dailyTarget / 1000).toFixed(1)}L
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Visualization */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Progress</span>
                <span className={hydrationStatus.color}>
                  {Math.round(getProgressPercentage())}%
                </span>
              </div>
              <Progress value={getProgressPercentage()} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0L</span>
                <span>{(hydrationGoal.dailyTarget / 1000).toFixed(1)}L Goal</span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="space-y-3">
              <h4 className="font-medium">Quick Add</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {QUICK_ADD_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    onClick={() => addHydration(amount)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {amount}ml
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseInt(e.target.value) || 500)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Custom amount (ml)"
                  min="50"
                  max="2000"
                />
              </div>
              <Button onClick={() => addHydration(customAmount)}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
              <Button variant="outline" onClick={removeLastEntry} disabled={todayEntries.length === 0}>
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Hydration Log</CardTitle>
          <CardDescription>
            {todayEntries.length} entries • Last: {hydrationGoal.lastIntakeTime ? format(hydrationGoal.lastIntakeTime, 'HH:mm') : 'None'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayEntries.length === 0 ? (
            <div className="text-center py-6">
              <Droplets className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hydration entries yet today</p>
              <p className="text-sm text-muted-foreground">Start tracking your water intake!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">{entry.amount}ml</p>
                      <p className="text-sm text-muted-foreground">
                        {format(entry.timestamp, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {entry.type.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements & Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Hydration Achievements
          </CardTitle>
          <CardDescription>
            Track your progress and unlock milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Achievement */}
            {currentMilestone && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{currentMilestone.icon}</div>
                  <div>
                    <h4 className="font-semibold text-blue-800">Current Level: {currentMilestone.name}</h4>
                    <p className="text-sm text-blue-600">Achieved by reaching {currentMilestone.threshold}ml daily</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Target */}
            {nextMilestone && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Next: {nextMilestone.name}</h4>
                  <span className="text-sm text-muted-foreground">
                    {hydrationGoal.currentIntake}/{nextMilestone.threshold}ml
                  </span>
                </div>
                <Progress 
                  value={(hydrationGoal.currentIntake / nextMilestone.threshold) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {nextMilestone.threshold - hydrationGoal.currentIntake}ml remaining to unlock
                </p>
              </div>
            )}

            {/* All Milestones */}
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MILESTONE_BADGES.map((badge, index) => (
                <div key={index} className={`p-3 border rounded-lg text-center ${
                  hydrationGoal.currentIntake >= badge.threshold 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <h4 className="font-medium text-sm">{badge.name}</h4>
                  <p className="text-xs text-muted-foreground">{badge.threshold}ml</p>
                  {hydrationGoal.currentIntake >= badge.threshold && (
                    <Badge className="mt-1 bg-green-500 text-white">Unlocked</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hydration Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Hydration Schedule</CardTitle>
          <CardDescription>
            Optimal times to maintain steady hydration throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {HYDRATION_REMINDERS.map((reminder, index) => {
              const [time, description] = reminder.split(' - ')
              const reminderHour = parseInt(time.split(':')[0])
              const currentHour = new Date().getHours()
              const isPassed = currentHour > reminderHour
              
              return (
                <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${
                  isPassed ? 'opacity-60' : 'bg-blue-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isPassed ? 'bg-gray-400' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{time}</span>
                      {!isPassed && currentHour === reminderHour && (
                        <Badge className="bg-blue-500 text-white">Now</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}