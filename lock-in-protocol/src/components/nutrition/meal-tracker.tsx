'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Clock, Utensils, CheckCircle, Calendar, Edit } from 'lucide-react'
import { MealType } from '@prisma/client'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface MealEntry {
  id: string
  date: Date
  mealType: MealType
  completed: boolean
  notes?: string
  plannedTime: string
  actualTime?: string
}

interface MealTemplate {
  mealType: MealType
  name: string
  plannedTime: string
  description: string
  estimatedCalories: number
  priority: 'high' | 'medium' | 'low'
}

const MEAL_TEMPLATES: MealTemplate[] = [
  {
    mealType: MealType.BREAKFAST_MESS,
    name: 'Breakfast (Mess)',
    plannedTime: '08:00',
    description: 'Start your day with a balanced breakfast from the mess',
    estimatedCalories: 400,
    priority: 'high'
  },
  {
    mealType: MealType.LUNCH_MESS,
    name: 'Lunch (Mess)',
    plannedTime: '13:00',
    description: 'Main meal with complete nutrition from mess',
    estimatedCalories: 600,
    priority: 'high'
  },
  {
    mealType: MealType.DINNER_MESS,
    name: 'Dinner (Mess)',
    plannedTime: '20:00',
    description: 'Evening meal to end the day well',
    estimatedCalories: 500,
    priority: 'high'
  },
  {
    mealType: MealType.POST_WORKOUT_SHAKE,
    name: 'Post-Workout Shake',
    plannedTime: '17:30',
    description: 'Recovery shake within 30 minutes post-workout',
    estimatedCalories: 250,
    priority: 'high'
  },
  {
    mealType: MealType.LATE_CHICKEN_MEAL,
    name: 'Late Chicken Meal',
    plannedTime: '22:00',
    description: 'High protein meal for muscle recovery',
    estimatedCalories: 350,
    priority: 'medium'
  }
]

const MEAL_TIMING_WINDOWS = {
  [MealType.BREAKFAST_MESS]: { ideal: '08:00', window: 60 }, // ±30min
  [MealType.LUNCH_MESS]: { ideal: '13:00', window: 90 }, // ±45min
  [MealType.DINNER_MESS]: { ideal: '20:00', window: 60 }, // ±30min
  [MealType.POST_WORKOUT_SHAKE]: { ideal: '17:30', window: 30 }, // ±15min (critical)
  [MealType.LATE_CHICKEN_MEAL]: { ideal: '22:00', window: 120 } // ±60min
}

export function MealTracker() {
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([])
  // const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [editingMeal, setEditingMeal] = useState<string | null>(null)

  useEffect(() => {
    // Initialize today's meals based on templates
    const today = new Date()
    const initialMeals = MEAL_TEMPLATES.map((template, index) => ({
      id: `meal-${index}`,
      date: today,
      mealType: template.mealType,
      completed: false,
      plannedTime: template.plannedTime,
      notes: undefined
    }))
    setTodayMeals(initialMeals)
  }, [])

  const toggleMealCompletion = (mealId: string) => {
    setTodayMeals(prev => prev.map(meal => {
      if (meal.id === mealId) {
        const updated = {
          ...meal,
          completed: !meal.completed,
          actualTime: !meal.completed ? new Date().toTimeString().slice(0, 5) : undefined
        }
        
        if (updated.completed) {
          const template = MEAL_TEMPLATES.find(t => t.mealType === meal.mealType)
          toast.success(`${template?.name || 'Meal'} logged successfully!`)
        }
        
        return updated
      }
      return meal
    }))
  }

  const updateMealNotes = (mealId: string, notes: string) => {
    setTodayMeals(prev => prev.map(meal => 
      meal.id === mealId ? { ...meal, notes } : meal
    ))
  }

  const getCompletionRate = () => {
    const completed = todayMeals.filter(meal => meal.completed).length
    return (completed / todayMeals.length) * 100
  }

  const getTimingStatus = (meal: MealEntry) => {
    if (!meal.completed || !meal.actualTime) return 'pending'
    
    const planned = new Date(`2000-01-01T${meal.plannedTime}:00`)
    const actual = new Date(`2000-01-01T${meal.actualTime}:00`)
    const diffMinutes = Math.abs(actual.getTime() - planned.getTime()) / (1000 * 60)
    
    const window = MEAL_TIMING_WINDOWS[meal.mealType]?.window || 60
    
    if (diffMinutes <= window / 2) return 'on-time'
    if (diffMinutes <= window) return 'acceptable'
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

  const getMealPriorityColor = (mealType: MealType) => {
    const template = MEAL_TEMPLATES.find(t => t.mealType === mealType)
    switch (template?.priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-300'
    }
  }

  const currentTime = new Date().toTimeString().slice(0, 5)
  const completedMeals = todayMeals.filter(meal => meal.completed).length
  const totalCalories = todayMeals
    .filter(meal => meal.completed)
    .reduce((sum, meal) => {
      const template = MEAL_TEMPLATES.find(t => t.mealType === meal.mealType)
      return sum + (template?.estimatedCalories || 0)
    }, 0)

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
            <div className="text-2xl font-bold">{completedMeals}/{todayMeals.length}</div>
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
            {todayMeals
              .sort((a, b) => a.plannedTime.localeCompare(b.plannedTime))
              .map((meal) => {
                const template = MEAL_TEMPLATES.find(t => t.mealType === meal.mealType)
                const timingStatus = getTimingStatus(meal)
                
                return (
                  <Card key={meal.id} className={`border-l-4 ${getMealPriorityColor(meal.mealType)}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={meal.completed}
                            onCheckedChange={() => toggleMealCompletion(meal.id)}
                            className="h-5 w-5"
                          />
                          <div>
                            <CardTitle className="text-lg">{template?.name || meal.mealType}</CardTitle>
                            <CardDescription>
                              Planned: {meal.plannedTime} 
                              {meal.actualTime && ` | Actual: ${meal.actualTime}`}
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
                            {template?.description || 'No description available'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm">Estimated Calories</h4>
                          <p className="text-sm text-muted-foreground">
                            {template?.estimatedCalories || 0} kcal
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm">Priority</h4>
                          <Badge variant={template?.priority === 'high' ? 'destructive' : 'secondary'}>
                            {template?.priority || 'medium'}
                          </Badge>
                        </div>
                      </div>

                      {editingMeal === meal.id && (
                        <div className="mt-4 space-y-2">
                          <Separator />
                          <div>
                            <label className="text-sm font-medium">Notes</label>
                            <Textarea
                              value={meal.notes || ''}
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

                      {meal.notes && editingMeal !== meal.id && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm">
                            <strong>Notes:</strong> {meal.notes}
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
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
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
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
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
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
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