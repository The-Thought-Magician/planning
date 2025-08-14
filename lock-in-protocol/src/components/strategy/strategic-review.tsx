'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Target, Calendar, Award, AlertCircle, CheckCircle, Eye } from 'lucide-react'

const STRATEGIC_METRICS = [
  { category: 'Academic', q1: 75, q2: 80, q3: 85, target: 90 },
  { category: 'Professional', q1: 85, q2: 90, q3: 95, target: 90 },
  { category: 'Fitness', q1: 60, q2: 70, q3: 80, target: 85 },
  { category: 'Personal', q1: 55, q2: 65, q3: 75, target: 80 }
]

const QUARTERLY_GOALS = [
  {
    id: '1',
    title: 'Achieve 9+ CGPA in Semester',
    category: 'Academic',
    status: 'on_track',
    progress: 78,
    target: 90,
    deadline: '2024-04-30',
    keyMetrics: ['Current CGPA: 8.7', 'Assignments completed: 85%', 'Exam preparation: 70%']
  },
  {
    id: '2',
    title: 'Launch DentenSur V3',
    category: 'Professional', 
    status: 'ahead',
    progress: 95,
    target: 100,
    deadline: '2024-03-15',
    keyMetrics: ['Features completed: 95%', 'Testing progress: 90%', 'Documentation: 85%']
  },
  {
    id: '3',
    title: 'Reach 100kg Bench Press',
    category: 'Fitness',
    status: 'behind',
    progress: 60,
    target: 80,
    deadline: '2024-06-01',
    keyMetrics: ['Current max: 85kg', 'Training consistency: 75%', 'Nutrition adherence: 80%']
  },
  {
    id: '4',
    title: 'Complete React Advanced Course',
    category: 'Personal',
    status: 'on_track',
    progress: 65,
    target: 70,
    deadline: '2024-03-30',
    keyMetrics: ['Modules completed: 8/12', 'Projects finished: 3/5', 'Practice hours: 45/80']
  }
]

const STRATEGIC_INSIGHTS = [
  {
    type: 'success',
    title: 'Professional Excellence',
    description: 'Consistently exceeding professional project targets with 95% completion rate.',
    recommendation: 'Maintain current momentum and consider taking on additional challenges.'
  },
  {
    type: 'warning',
    title: 'Fitness Goals Lagging',
    description: 'Fitness progress is 20% behind target due to inconsistent training schedule.',
    recommendation: 'Restructure workout schedule and consider hiring a personal trainer.'
  },
  {
    type: 'opportunity',
    title: 'Academic Acceleration Possible',
    description: 'Strong foundation allows for pursuing advanced coursework or research opportunities.',
    recommendation: 'Explore additional academic projects or independent study options.'
  }
]

export function StrategicReview() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-green-500'
      case 'on_track': return 'bg-blue-500'
      case 'behind': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ahead': return 'Ahead of Schedule'
      case 'on_track': return 'On Track'
      case 'behind': return 'Behind Schedule'
      default: return 'Unknown'
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-blue-600" />
      default: return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50'
      case 'warning': return 'border-yellow-200 bg-yellow-50'
      case 'opportunity': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Strategic Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Strategic Performance Overview
          </CardTitle>
          <CardDescription>
            High-level view of progress across all major life categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STRATEGIC_METRICS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="q3" fill="#3b82f6" name="Current" />
                <Bar dataKey="target" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Goals Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quarterly Goals Review
          </CardTitle>
          <CardDescription>
            Status update on your major quarterly objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {QUARTERLY_GOALS.map((goal) => (
              <Card key={goal.id} className="border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">Due: {goal.deadline}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(goal.status)}>
                          {getStatusText(goal.status)}
                        </Badge>
                        <Badge variant="outline">{goal.category}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}% / {goal.target}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    <div className="grid gap-1 text-xs text-muted-foreground">
                      {goal.keyMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                          {metric}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Progress Trends</CardTitle>
          <CardDescription>
            Track how your performance has evolved over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={STRATEGIC_METRICS}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="q1" stroke="#ef4444" name="Q1" />
                <Line type="monotone" dataKey="q2" stroke="#f59e0b" name="Q2" />
                <Line type="monotone" dataKey="q3" stroke="#3b82f6" name="Q3 (Current)" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Insights & Recommendations</CardTitle>
          <CardDescription>
            AI-powered analysis of your strategic performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {STRATEGIC_INSIGHTS.map((insight, index) => (
              <div key={index} className={`p-4 border rounded-lg ${getInsightColor(insight.type)}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <div className="p-2 bg-white/50 rounded text-xs">
                    <strong>Recommendation:</strong> {insight.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Actions for Next Quarter</CardTitle>
          <CardDescription>
            Recommended focus areas and strategic moves
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Double Down On</h4>
              <div className="space-y-2">
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Professional Projects:</strong> Leverage current momentum to take on more challenging assignments
                  </p>
                </div>
                <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Academic Excellence:</strong> Current trajectory suggests potential for honors/distinction
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-red-600">Address Urgently</h4>
              <div className="space-y-2">
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Fitness Consistency:</strong> Risk of missing annual fitness goals without intervention
                  </p>
                </div>
                <div className="p-3 border border-red-200 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    <strong>Work-Life Balance:</strong> High professional performance may be unsustainable long-term
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Strategic Planning Session
            </Button>
            <Button variant="outline">
              Export Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}