'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Clock, Utensils, CheckCircle, Calendar, Edit, AlertCircle } from 'lucide-react'
import { useMeals, useCreateMeal } from '@/hooks/use-dashboard'
import type { MealEntry } from '@/types/api'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface MealTemplate {
  mealType: string
  name: string
  plannedTime: string
  description: string
  estimatedCalories: number
  priority: 'high' | 'medium' | 'low'
}

const MEAL_TEMPLATES: MealTemplate[] = [
  {
    mealType: 'BREAKFAST_MESS',
    name: 'Breakfast (Mess)',
    plannedTime: '08:00',
    description: 'Start your day with a balanced breakfast from the mess',
    estimatedCalories: 400,
    priority: 'high'
  },
  {
    mealType: 'LUNCH_MESS',
    name: 'Lunch (Mess)',
    plannedTime: '13:00',
    description: 'Main meal with complete nutrition from mess',
    estimatedCalories: 600,
    priority: 'high'
  },
  {
    mealType: 'DINNER_MESS',
    name: 'Dinner (Mess)',
    plannedTime: '20:00',
    description: 'Evening meal to end the day well',
    estimatedCalories: 500,
    priority: 'high'
  },
  {
    mealType: 'POST_WORKOUT_SHAKE',
    name: 'Post-Workout Shake',
    plannedTime: '17:30',
    description: 'Recovery shake within 30 minutes post-workout',
    estimatedCalories: 250,
    priority: 'high'
  },
  {
    mealType: 'LATE_CHICKEN_MEAL',
    name: 'Late Chicken Meal',
    plannedTime: '22:00',
    description: 'High protein meal for muscle recovery',
    estimatedCalories: 350,
    priority: 'medium'
  }
]

const MEAL_TIMING_WINDOWS: Record<string, { ideal: string; window: number }> = {
  'BREAKFAST_MESS': { ideal: '08:00', window: 60 }, // ±30min
  'LUNCH_MESS': { ideal: '13:00', window: 90 }, // ±45min
  'DINNER_MESS': { ideal: '20:00', window: 60 }, // ±30min
  'POST_WORKOUT_SHAKE': { ideal: '17:30', window: 30 }, // ±15min (critical)
  'LATE_CHICKEN_MEAL': { ideal: '22:00', window: 120 } // ±60min
}

// Helper function to get template data for a meal type
function getMealTemplate(mealType: string): MealTemplate | undefined {
  return MEAL_TEMPLATES.find(template => template.mealType === mealType)
}

// Helper function to merge API data with templates
function createDisplayMeals(apiMeals: MealEntry[]): (MealEntry & { template: MealTemplate })[] {
  const mealMap = new Map<string, MealEntry>()
  
  // Create map of existing meals by type
  apiMeals.forEach(meal => {
    mealMap.set(meal.mealType, meal)
  })

  // Create display meals with templates
  const displayMeals: (MealEntry & { template: MealTemplate })[] = []
  
  MEAL_TEMPLATES.forEach(template => {
    const existingMeal = mealMap.get(template.mealType)
    
    if (existingMeal) {
      // Use existing meal data
      displayMeals.push({
        ...existingMeal,
        template
      })
    } else {
      // Create placeholder meal based on template
      const today = new Date()
      displayMeals.push({
        id: `placeholder-${template.mealType}`,
        userId: 'current-user', // This would come from auth context
        date: today,
        mealType: template.mealType,
        completed: false,
        notes: undefined,
        createdAt: today,
        updatedAt: today,
        template
      })
    }
  })

  return displayMeals.sort((a, b) => a.template.plannedTime.localeCompare(b.template.plannedTime))
}

export function MealTracker() {
  const [editingMeal, setEditingMeal] = useState<string | null>(null)
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const today = format(new Date(), 'yyyy-MM-dd')

  const {
    data: mealsResponse,
    isLoading: mealsLoading,
    error: mealsError,
  } = useMeals(today)

  const createMealMutation = useCreateMeal()

  if (mealsLoading) {
    return <MealTrackerSkeleton />
  }

  if (mealsError) {
    return <MealTrackerError error={mealsError.message} />
  }

  const apiMeals = (mealsResponse?.success ? mealsResponse.data : []) as MealEntry[]
  const displayMeals = createDisplayMeals(apiMeals)

  const toggleMealCompletion = async (meal: MealEntry & { template: MealTemplate }) => {
    if (meal.id.startsWith('placeholder-')) {
      // Create new meal entry
      const mealData = {
        date: new Date(),
        mealType: meal.mealType,
        completed: true,
        notes: localNotes[meal.id] || undefined
      }
      
      createMealMutation.mutate(mealData, {
        onSuccess: () => {
          const template = getMealTemplate(meal.mealType)
          toast.success(`${template?.name || 'Meal'} logged successfully!`)
        }
      })
    } else {
      // Update existing meal
      const updatedData = {
        ...meal,
        completed: !meal.completed,
        notes: localNotes[meal.id] || meal.notes
      }
      
      // Here you would call updateMeal API - for now just show success
      toast.success(`${meal.template.name} ${updatedData.completed ? 'completed' : 'uncompleted'}!`)
    }
  }

  const updateMealNotes = (mealId: string, notes: string) => {
    setLocalNotes(prev => ({
      ...prev,
      [mealId]: notes
    }))
  }

  const getCompletionRate = () => {
    const completed = displayMeals.filter(meal => meal.completed).length
    return (completed / displayMeals.length) * 100
  }

  const getTimingStatus = (meal: MealEntry & { template: MealTemplate }) => {
    if (!meal.completed) { return 'pending' }
    
    const planned = new Date(`2000-01-01T${meal.template.plannedTime}:00`)
    const actual = new Date() // In real app, you'd get actual completion time
    const diffMinutes = Math.abs(actual.getTime() - planned.getTime()) / (1000 * 60)
    
    const window = MEAL_TIMING_WINDOWS[meal.mealType]?.window || 60
    
    if (diffMinutes <= window / 2) { return 'on-time' }
    if (diffMinutes <= window) { return 'acceptable' }
    return 'late'
  }

  const getTimingBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return <Badge className="bg-green-500 text-white">On Time</Badge>
      case 'acceptable':
        return <Badge className="bg-yellow-500 text-white">Close</Badge>
      case 'late':
        return <Badge className="bg-red-500 text-white">Late</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  const getMealPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const currentTime = new Date().toTimeString().slice(0, 5)
  const completedMeals = displayMeals.filter(meal => meal.completed).length
  const totalCalories = displayMeals
    .filter(meal => meal.completed)
    .reduce((sum, meal) => sum + meal.template.estimatedCalories, 0)

  return (
    <div className="space-y-6">
      {/* Daily Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Today</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMeals}/{displayMeals.length}</div>
            <Progress value={getCompletionRate()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Tracked</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalories}</div>
            <p className="text-xs text-muted-foreground">estimated intake</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(getCompletionRate())}%</div>
            <p className="text-xs text-muted-foreground">today&apos;s adherence</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentTime}</div>
            <p className="text-xs text-muted-foreground">{format(new Date(), 'MMM dd, yyyy')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Meal Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Meal Plan
          </CardTitle>
          <CardDescription>
            Track your meal timing and completion throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayMeals.map((meal) => {
              const timingStatus = getTimingStatus(meal)
              const notes = localNotes[meal.id] || meal.notes || ''
              
              return (
                <Card key={meal.id} className={`border-l-4 ${getMealPriorityColor(meal.template.priority)}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={meal.completed}
                          onCheckedChange={() => toggleMealCompletion(meal)}
                          className="h-5 w-5"
                          disabled={createMealMutation.isPending}
                        />
                        <div>
                          <CardTitle className="text-lg">{meal.template.name}</CardTitle>
                          <CardDescription>
                            Planned: {meal.template.plannedTime}
                            {meal.completed && ` | Completed`}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTimingBadge(timingStatus)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingMeal(meal.id === editingMeal ? null : meal.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-sm">Description</h4>
                        <p className="text-sm text-muted-foreground">
                          {meal.template.description}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm">Estimated Calories</h4>
                        <p className="text-sm text-muted-foreground">
                          {meal.template.estimatedCalories} kcal
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm">Priority</h4>
                        <Badge variant={meal.template.priority === 'high' ? 'destructive' : 'secondary'}>
                          {meal.template.priority}
                        </Badge>
                      </div>
                    </div>

                    {editingMeal === meal.id && (
                      <div className="mt-4 space-y-2">
                        <Separator />
                        <div>
                          <label className="text-sm font-medium">Notes</label>
                          <Textarea
                            value={notes}
                            onChange={(e) => updateMealNotes(meal.id, e.target.value)}
                            placeholder="Add notes about this meal (portion size, satisfaction, etc.)"
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => setEditingMeal(null)}
                          >
                            Save Notes
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingMeal(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {notes && editingMeal !== meal.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">
                          <strong>Notes:</strong> {notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Meal Timing Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Meal Timing Guidelines</CardTitle>
          <CardDescription>
            Optimal timing windows for maximum nutritional benefit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Post-Workout Window</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Critical for muscle protein synthesis
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs">Within 30 minutes post-workout</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Regular Meals</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Maintain steady energy levels
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs">±30-45 minutes from planned time</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Late Meals</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Support overnight recovery
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs">Flexible timing, 2-3 hours before sleep</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Loading skeleton component
function MealTrackerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Daily Overview Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meal Timeline Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-l-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-5" />
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guidelines Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-full" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Error component
function MealTrackerError({ error }: { error: string }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span>Error Loading Meal Data</span>
        </CardTitle>
        <CardDescription>
          Unable to load your meal tracking data
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