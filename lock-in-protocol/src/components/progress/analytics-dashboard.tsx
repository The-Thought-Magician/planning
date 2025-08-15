'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Calendar, Target, Zap, Award } from 'lucide-react'

const WEEKLY_DATA = [
  { week: 'Week 1', scheduleAdherence: 85, workouts: 4, deepWork: 6.5, pomodoros: 32 },
  { week: 'Week 2', scheduleAdherence: 90, workouts: 4, deepWork: 7.2, pomodoros: 38 },
  { week: 'Week 3', scheduleAdherence: 75, workouts: 3, deepWork: 5.8, pomodoros: 28 },
  { week: 'Week 4', scheduleAdherence: 95, workouts: 4, deepWork: 8.1, pomodoros: 42 },
  { week: 'Week 5', scheduleAdherence: 88, workouts: 4, deepWork: 7.5, pomodoros: 36 }
]

const CATEGORY_PERFORMANCE = [
  { name: 'Academic', completion: 78, color: '#8884d8' },
  { name: 'Professional', completion: 92, color: '#82ca9d' },
  { name: 'Fitness', completion: 85, color: '#ffc658' },
  { name: 'Personal', completion: 67, color: '#ff7300' }
]

const DAILY_ENERGY = [
  { day: 'Mon', energy: 8, focus: 7, productivity: 85 },
  { day: 'Tue', energy: 7, focus: 8, productivity: 90 },
  { day: 'Wed', energy: 6, focus: 6, productivity: 70 },
  { day: 'Thu', energy: 9, focus: 9, productivity: 95 },
  { day: 'Fri', energy: 7, focus: 7, productivity: 80 },
  { day: 'Sat', energy: 8, focus: 6, productivity: 75 },
  { day: 'Sun', energy: 5, focus: 5, productivity: 60 }
]

export function AnalyticsDashboard() {
  const currentWeekData = WEEKLY_DATA[WEEKLY_DATA.length - 1]
  const previousWeekData = WEEKLY_DATA[WEEKLY_DATA.length - 2]
  
  const adherenceChange = currentWeekData.scheduleAdherence - previousWeekData.scheduleAdherence
  const deepWorkChange = currentWeekData.deepWork - previousWeekData.deepWork
  const pomodoroChange = currentWeekData.pomodoros - previousWeekData.pomodoros

  const getTrendIcon = (change: number) => {
    if (change > 0) {return <TrendingUp className="h-4 w-4 text-green-500" />}
    if (change < 0) {return <TrendingDown className="h-4 w-4 text-red-500" />}
    return <span className="text-muted-foreground">-</span>
  }

  const getTrendColor = (change: number) => {
    if (change > 0) {return 'text-green-600'}
    if (change < 0) {return 'text-red-600'}
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Adherence</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekData.scheduleAdherence}%</div>
            <div className="flex items-center gap-1">
              {getTrendIcon(adherenceChange)}
              <p className={`text-xs ${getTrendColor(adherenceChange)}`}>
                {adherenceChange > 0 ? '+' : ''}{adherenceChange}% from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deep Work Hours</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekData.deepWork}h</div>
            <div className="flex items-center gap-1">
              {getTrendIcon(deepWorkChange)}
              <p className={`text-xs ${getTrendColor(deepWorkChange)}`}>
                {deepWorkChange > 0 ? '+' : ''}{deepWorkChange.toFixed(1)}h from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pomodoro Sessions</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekData.pomodoros}</div>
            <div className="flex items-center gap-1">
              {getTrendIcon(pomodoroChange)}
              <p className={`text-xs ${getTrendColor(pomodoroChange)}`}>
                {pomodoroChange > 0 ? '+' : ''}{pomodoroChange} from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <Progress value={87} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Schedule Adherence Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Adherence Trend</CardTitle>
            <CardDescription>Weekly adherence percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[60, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="scheduleAdherence" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance by Category</CardTitle>
            <CardDescription>Completion rates across different areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CATEGORY_PERFORMANCE.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-sm text-muted-foreground">{category.completion}%</span>
                  </div>
                  <Progress value={category.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deep Work & Productivity */}
        <Card>
          <CardHeader>
            <CardTitle>Deep Work Progress</CardTitle>
            <CardDescription>Deep work hours and pomodoro sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="deepWork" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Energy & Focus */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Energy & Focus</CardTitle>
            <CardDescription>This week&apos;s energy and focus levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DAILY_ENERGY}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="energy" fill="#ffc658" />
                  <Bar dataKey="focus" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Data-driven observations about your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">Improving Trend</h4>
              </div>
              <p className="text-sm text-green-700">
                Your schedule adherence has improved by 13% over the last month. Great consistency!
              </p>
            </div>
            
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">Deep Work Goal</h4>
              </div>
              <p className="text-sm text-blue-700">
                You&apos;re averaging 7.2 hours of deep work per week. Target: 8 hours. Almost there!
              </p>
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Midweek Dip</h4>
              </div>
              <p className="text-sm text-yellow-700">
                Wednesdays show consistently lower energy levels. Consider lighter scheduling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}