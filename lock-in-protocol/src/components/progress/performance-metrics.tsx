'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'
import { Activity, Clock, Target, Zap, TrendingUp, Brain } from 'lucide-react'

const PERFORMANCE_TRENDS = [
  { date: '2024-01-08', productivity: 85, energy: 8, focus: 7, stress: 3 },
  { date: '2024-01-09', productivity: 90, energy: 9, focus: 8, stress: 2 },
  { date: '2024-01-10', productivity: 70, energy: 6, focus: 6, stress: 5 },
  { date: '2024-01-11', productivity: 95, energy: 9, focus: 9, stress: 2 },
  { date: '2024-01-12', productivity: 80, energy: 7, focus: 7, stress: 4 },
  { date: '2024-01-13', productivity: 88, energy: 8, focus: 8, stress: 3 },
  { date: '2024-01-14', productivity: 92, energy: 8, focus: 8, stress: 2 }
]

const SKILLS_RADAR = [
  { skill: 'Time Management', current: 85, target: 90 },
  { skill: 'Focus & Concentration', current: 78, target: 85 },
  { skill: 'Goal Achievement', current: 82, target: 88 },
  { skill: 'Habit Consistency', current: 90, target: 95 },
  { skill: 'Work-Life Balance', current: 75, target: 82 },
  { skill: 'Stress Management', current: 80, target: 85 }
]

export function PerformanceMetrics() {
  const currentWeekAvg = {
    productivity: 86,
    energy: 7.9,
    focus: 7.6,
    stress: 3.0
  }

  const lastWeekAvg = {
    productivity: 82,
    energy: 7.5,
    focus: 7.2,
    stress: 3.5
  }

  const getMetricChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      isNegative: change < 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Week Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekAvg.productivity}%</div>
            <div className="flex items-center gap-1">
              {getMetricChange(currentWeekAvg.productivity, lastWeekAvg.productivity).isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
              )}
              <p className="text-xs text-muted-foreground">
                {getMetricChange(currentWeekAvg.productivity, lastWeekAvg.productivity).value.toFixed(1)}% vs last week
              </p>
            </div>
            <Progress value={currentWeekAvg.productivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Level</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekAvg.energy}/10</div>
            <div className="flex items-center gap-1">
              {getMetricChange(currentWeekAvg.energy, lastWeekAvg.energy).isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
              )}
              <p className="text-xs text-muted-foreground">
                +{(currentWeekAvg.energy - lastWeekAvg.energy).toFixed(1)} vs last week
              </p>
            </div>
            <Progress value={currentWeekAvg.energy * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
            <Brain className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekAvg.focus}/10</div>
            <div className="flex items-center gap-1">
              {getMetricChange(currentWeekAvg.focus, lastWeekAvg.focus).isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
              )}
              <p className="text-xs text-muted-foreground">
                +{(currentWeekAvg.focus - lastWeekAvg.focus).toFixed(1)} vs last week
              </p>
            </div>
            <Progress value={currentWeekAvg.focus * 10} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stress Level</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWeekAvg.stress}/10</div>
            <div className="flex items-center gap-1">
              {currentWeekAvg.stress < lastWeekAvg.stress ? (
                <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
              ) : (
                <TrendingUp className="h-4 w-4 text-red-500" />
              )}
              <p className="text-xs text-muted-foreground">
                {currentWeekAvg.stress < lastWeekAvg.stress ? '-' : '+'}{Math.abs(currentWeekAvg.stress - lastWeekAvg.stress).toFixed(1)} vs last week
              </p>
            </div>
            <Progress value={100 - (currentWeekAvg.stress * 10)} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Performance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance Trends</CardTitle>
            <CardDescription>Daily productivity, energy, and focus levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={PERFORMANCE_TRENDS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Productivity %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Energy (1-10)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Focus (1-10)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skills Assessment Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
            <CardDescription>Current vs target skill levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={SKILLS_RADAR}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#82ca9d"
                    fill="transparent"
                    strokeDasharray="5 5"
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Skill Development Progress</CardTitle>
          <CardDescription>Track improvement in key productivity areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SKILLS_RADAR.map((skill, index) => {
              const progress = (skill.current / skill.target) * 100
              const gap = skill.target - skill.current
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {skill.current}% / {skill.target}%
                      </span>
                      <Badge variant={progress >= 90 ? 'default' : progress >= 80 ? 'secondary' : 'outline'}>
                        {progress >= 90 ? 'Excellent' : progress >= 80 ? 'Good' : 'Needs Work'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {gap > 0 ? `${gap}% to reach target` : 'Target achieved!'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>Observations and recommendations based on your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Strengths</h4>
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Habit Consistency:</strong> 90% - Excellent at maintaining daily routines
                  </p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Time Management:</strong> 85% - Strong scheduling and adherence skills
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Improvement Areas</h4>
              <div className="space-y-2">
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Work-Life Balance:</strong> 75% - Consider more dedicated rest time
                  </p>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Focus:</strong> 78% - Try longer pomodoro sessions or fewer distractions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}