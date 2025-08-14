'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Target, Droplets, Utensils, Pill, Award } from 'lucide-react'
import { format } from 'date-fns'

interface NutritionMetric {
  date: string
  mealAdherence: number // 0-100
  supplementAdherence: number // 0-100
  hydrationLevel: number // liters
  caloriesEstimated: number
  mealTiming: number // average minutes from planned
}

interface WeeklySummary {
  period: string
  mealCompletionRate: number
  supplementCompletionRate: number
  averageHydration: number
  hydrationGoalHits: number
  bestDay: string
  improvementArea: string
}

const MOCK_WEEKLY_DATA: NutritionMetric[] = [
  { date: '2024-01-08', mealAdherence: 85, supplementAdherence: 90, hydrationLevel: 3.2, caloriesEstimated: 2100, mealTiming: 15 },
  { date: '2024-01-09', mealAdherence: 90, supplementAdherence: 85, hydrationLevel: 2.8, caloriesEstimated: 2250, mealTiming: 25 },
  { date: '2024-01-10', mealAdherence: 75, supplementAdherence: 95, hydrationLevel: 3.5, caloriesEstimated: 1950, mealTiming: 45 },
  { date: '2024-01-11', mealAdherence: 95, supplementAdherence: 90, hydrationLevel: 3.1, caloriesEstimated: 2300, mealTiming: 10 },
  { date: '2024-01-12', mealAdherence: 80, supplementAdherence: 80, hydrationLevel: 2.9, caloriesEstimated: 2050, mealTiming: 35 },
  { date: '2024-01-13', mealAdherence: 100, supplementAdherence: 100, hydrationLevel: 3.8, caloriesEstimated: 2400, mealTiming: 5 },
  { date: '2024-01-14', mealAdherence: 85, supplementAdherence: 85, hydrationLevel: 3.0, caloriesEstimated: 2150, mealTiming: 20 }
]

const MEAL_DISTRIBUTION_DATA = [
  { name: 'Breakfast', value: 95, color: '#8884d8' },
  { name: 'Lunch', value: 90, color: '#82ca9d' },
  { name: 'Dinner', value: 85, color: '#ffc658' },
  { name: 'Post-Workout', value: 100, color: '#ff7300' },
  { name: 'Late Meal', value: 70, color: '#00ff88' }
]

const SUPPLEMENT_DISTRIBUTION_DATA = [
  { name: 'Creatine', value: 95, color: '#8884d8' },
  { name: 'Whey Protein', value: 100, color: '#82ca9d' },
  { name: 'Post-Workout Milk', value: 90, color: '#ffc658' },
  { name: 'Pre-Sleep Milk', value: 80, color: '#ff7300' }
]

export function NutritionAnalytics() {
  // const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [weeklyData] = useState<NutritionMetric[]>(MOCK_WEEKLY_DATA)

  const calculateWeeklySummary = (): WeeklySummary => {
    const avgMealAdherence = weeklyData.reduce((sum, day) => sum + day.mealAdherence, 0) / weeklyData.length
    const avgSupplementAdherence = weeklyData.reduce((sum, day) => sum + day.supplementAdherence, 0) / weeklyData.length
    const avgHydration = weeklyData.reduce((sum, day) => sum + day.hydrationLevel, 0) / weeklyData.length
    const hydrationGoalHits = weeklyData.filter(day => day.hydrationLevel >= 3.0).length
    
    const bestDay = weeklyData.reduce((best, current) => 
      (current.mealAdherence + current.supplementAdherence) > (best.mealAdherence + best.supplementAdherence) ? current : best
    )
    
    let improvementArea = 'meal_timing'
    if (avgMealAdherence < 85) improvementArea = 'meal_adherence'
    else if (avgSupplementAdherence < 85) improvementArea = 'supplement_adherence'
    else if (avgHydration < 3.0) improvementArea = 'hydration'
    
    return {
      period: 'This Week',
      mealCompletionRate: avgMealAdherence,
      supplementCompletionRate: avgSupplementAdherence,
      averageHydration: avgHydration,
      hydrationGoalHits,
      bestDay: format(new Date(bestDay.date), 'EEEE'),
      improvementArea
    }
  }

  const summary = calculateWeeklySummary()
  const overallScore = (summary.mealCompletionRate + summary.supplementCompletionRate + (summary.averageHydration / 3.0 * 100)) / 3

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <span className="text-muted-foreground">-</span>
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getImprovementMessage = (area: string) => {
    switch (area) {
      case 'meal_adherence': return 'Focus on completing all planned meals'
      case 'supplement_adherence': return 'Improve supplement timing consistency'
      case 'hydration': return 'Increase daily water intake'
      case 'meal_timing': return 'Work on meal timing accuracy'
      default: return 'Maintain current excellent habits'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {Math.round(overallScore)}%
            </div>
            <Progress value={overallScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meal Adherence</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summary.mealCompletionRate)}%
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(summary.mealCompletionRate, 82)}
              <p className="text-xs text-muted-foreground">vs last week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supplement Adherence</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(summary.supplementCompletionRate)}%
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(summary.supplementCompletionRate, 85)}
              <p className="text-xs text-muted-foreground">vs last week</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hydration Average</CardTitle>
            <Droplets className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.averageHydration.toFixed(1)}L
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(summary.averageHydration, 2.8)}
              <p className="text-xs text-muted-foreground">{summary.hydrationGoalHits}/7 goal days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {/* Weekly Adherence Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Adherence Trends</CardTitle>
              <CardDescription>
                Track your consistency across meals and supplements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'EEEE, MMM dd')}
                      formatter={(value, name) => [
                        `${value}%`,
                        name === 'mealAdherence' ? 'Meal Adherence' : 'Supplement Adherence'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mealAdherence" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="supplementAdherence" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                      dot={{ fill: '#82ca9d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Hydration Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Hydration Levels</CardTitle>
              <CardDescription>
                Track your water intake over time (Goal: 3.0L)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis domain={[0, 4]} />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'EEEE, MMM dd')}
                      formatter={(value) => [`${value}L`, 'Hydration']}
                    />
                    <Bar dataKey="hydrationLevel" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Meal Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Meal Completion Rates</CardTitle>
                <CardDescription>
                  Breakdown by meal type (Last 7 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MEAL_DISTRIBUTION_DATA.map((meal, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{meal.name}</span>
                        <span className="text-sm text-muted-foreground">{meal.value}%</span>
                      </div>
                      <Progress value={meal.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supplement Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Supplement Adherence</CardTitle>
                <CardDescription>
                  Breakdown by supplement type (Last 7 days)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SUPPLEMENT_DISTRIBUTION_DATA.map((supplement, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{supplement.name}</span>
                        <span className="text-sm text-muted-foreground">{supplement.value}%</span>
                      </div>
                      <Progress value={supplement.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timing Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Meal Timing Analysis</CardTitle>
              <CardDescription>
                Average deviation from planned meal times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(new Date(value), 'EEEE, MMM dd')}
                      formatter={(value) => [`${value} min`, 'Average Delay']}
                    />
                    <Bar dataKey="mealTiming" fill="#fbbf24" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Weekly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Summary</CardTitle>
              <CardDescription>
                {summary.period} - {format(new Date(), 'MMM dd, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Best Performance Day</h4>
                    <Badge className="bg-green-500 text-white">{summary.bestDay}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Highest combined meal and supplement adherence
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Hydration Success</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{summary.hydrationGoalHits}</span>
                      <span className="text-sm text-muted-foreground">/ 7 days hit goal</span>
                    </div>
                    <Progress value={(summary.hydrationGoalHits / 7) * 100} className="mt-1" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Primary Focus Area</h4>
                    <Badge variant="outline" className="mb-2">
                      {summary.improvementArea.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {getImprovementMessage(summary.improvementArea)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Overall Grade</h4>
                    <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore >= 90 ? 'A' : overallScore >= 80 ? 'B' : overallScore >= 70 ? 'C' : 'D'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on meal, supplement, and hydration adherence
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Data-driven suggestions to improve your nutrition consistency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.mealCompletionRate < 85 && (
                  <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Improve Meal Consistency</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Your meal adherence is at {Math.round(summary.mealCompletionRate)}%. Try setting phone reminders 30 minutes before each planned meal.
                    </p>
                  </div>
                )}

                {summary.supplementCompletionRate < 90 && (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Supplement Timing Optimization</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Consider linking supplement intake to existing habits (e.g., take creatine with breakfast) to improve consistency.
                    </p>
                  </div>
                )}

                {summary.averageHydration < 3.0 && (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Increase Hydration</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your average daily intake is {summary.averageHydration.toFixed(1)}L. Try keeping a water bottle visible and setting hourly reminders.
                    </p>
                  </div>
                )}

                {overallScore >= 90 && (
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-green-800">Excellent Performance!</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      You&apos;re maintaining excellent nutrition habits. Consider tracking more detailed metrics like meal macronutrients or supplement timing precision.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}