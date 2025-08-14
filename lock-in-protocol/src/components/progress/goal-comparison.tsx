'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line } from 'recharts'
import { Target, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

const GOAL_COMPARISON_DATA = [
  { 
    category: 'Academic', 
    planned: 85, 
    actual: 78, 
    target: 90,
    tasks: { completed: 12, total: 15 }
  },
  { 
    category: 'Professional', 
    planned: 80, 
    actual: 92, 
    target: 85,
    tasks: { completed: 18, total: 20 }
  },
  { 
    category: 'Fitness', 
    planned: 90, 
    actual: 85, 
    target: 88,
    tasks: { completed: 8, total: 10 }
  },
  { 
    category: 'Personal', 
    planned: 75, 
    actual: 67, 
    target: 80,
    tasks: { completed: 6, total: 12 }
  }
]

const WEEKLY_TARGETS = [
  { week: 'W1', planned: 80, actual: 75, target: 85 },
  { week: 'W2', planned: 82, actual: 88, target: 85 },
  { week: 'W3', planned: 85, actual: 70, target: 85 },
  { week: 'W4', planned: 88, actual: 95, target: 85 },
  { week: 'W5', planned: 90, actual: 87, target: 85 }
]

export function GoalComparison() {
  const getPerformanceStatus = (actual: number, planned: number, target: number) => {
    if (actual >= target) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle }
    if (actual >= planned) return { status: 'good', color: 'text-blue-600', icon: TrendingUp }
    if (actual >= planned * 0.8) return { status: 'needs-improvement', color: 'text-yellow-600', icon: AlertCircle }
    return { status: 'concerning', color: 'text-red-600', icon: AlertCircle }
  }

  const getVariancePercentage = (actual: number, planned: number) => {
    return ((actual - planned) / planned) * 100
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals on Track</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">2/4</div>
            <p className="text-xs text-muted-foreground">categories meeting targets</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overperforming</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1</div>
            <p className="text-xs text-muted-foreground">exceeding planned goals</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Underperforming</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <p className="text-xs text-muted-foreground">below planned performance</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Variance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-2.5%</div>
            <p className="text-xs text-muted-foreground">planned vs actual</p>
          </CardContent>
        </Card>
      </div>

      {/* Goal vs Actual Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Goal vs Actual Performance</CardTitle>
          <CardDescription>Compare planned goals with actual achievements by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GOAL_COMPARISON_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#e5e7eb" name="Planned" />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                <Bar dataKey="target" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Performance Analysis</CardTitle>
          <CardDescription>Category-wise breakdown of goals vs achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {GOAL_COMPARISON_DATA.map((item, index) => {
              const status = getPerformanceStatus(item.actual, item.planned, item.target)
              const variance = getVariancePercentage(item.actual, item.planned)
              const StatusIcon = status.icon
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{item.category}</h3>
                      <Badge variant={status.status === 'excellent' ? 'default' : 'outline'} className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.tasks.completed}/{item.tasks.total} tasks completed
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Planned Goal</span>
                        <span className="font-medium">{item.planned}%</span>
                      </div>
                      <Progress value={item.planned} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Actual Achievement</span>
                        <span className="font-medium">{item.actual}%</span>
                      </div>
                      <Progress value={item.actual} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Target</span>
                        <span className="font-medium">{item.target}%</span>
                      </div>
                      <Progress value={item.target} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                    <span className="font-medium">Variance: </span>
                    <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {variance >= 0 ? '+' : ''}{variance.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground ml-2">
                      ({variance >= 0 ? 'above' : 'below'} planned goal)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Trend</CardTitle>
          <CardDescription>Track how your actual performance compares to plans over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={WEEKLY_TARGETS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="planned" fill="#e5e7eb" name="Planned" />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                <Line dataKey="target" stroke="#10b981" strokeWidth={2} name="Target" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
          <CardDescription>Based on your goal vs actual performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">High Priority</span>
              </div>
              <p className="text-sm text-red-700">
                Personal goals are 8% below planned. Consider reducing commitments or adjusting timeline.
              </p>
            </div>
            
            <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Medium Priority</span>
              </div>
              <p className="text-sm text-yellow-700">
                Academic performance is 7% below plan. Increase study time or seek additional support.
              </p>
            </div>
            
            <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Keep It Up</span>
              </div>
              <p className="text-sm text-green-700">
                Professional goals are exceeding expectations by 12%. Great work maintaining this momentum!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}