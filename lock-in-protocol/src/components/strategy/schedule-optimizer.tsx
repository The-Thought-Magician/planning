'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Settings, Clock, Brain, Zap, AlertTriangle, CheckCircle } from 'lucide-react'

const OPTIMIZATION_SUGGESTIONS = [
  {
    id: '1',
    title: 'Optimize Deep Work Blocks',
    description: 'Your most productive hours (9-11 AM) should be reserved for high-cognitive tasks',
    impact: 'high',
    effort: 'low',
    category: 'Productivity',
    currentState: 'Using 60% of peak hours for deep work',
    recommendation: 'Block 9-11 AM daily for most important academic/professional tasks',
    estimatedGain: '+25% productivity in core tasks'
  },
  {
    id: '2', 
    title: 'Consolidate Similar Tasks',
    description: 'Batch similar tasks together to reduce context switching',
    impact: 'medium',
    effort: 'low',
    category: 'Efficiency',
    currentState: 'Tasks scattered throughout the day',
    recommendation: 'Group emails, calls, and admin tasks into 2-hour blocks',
    estimatedGain: '+15% time savings'
  },
  {
    id: '3',
    title: 'Optimize Workout Timing',
    description: 'Current workout schedule conflicts with energy patterns',
    impact: 'medium',
    effort: 'medium',
    category: 'Energy',
    currentState: 'Working out during low-energy periods',
    recommendation: 'Move workouts to 5-6 PM when energy naturally peaks',
    estimatedGain: '+20% workout performance'
  },
  {
    id: '4',
    title: 'Buffer Time Optimization',
    description: 'Add strategic buffer time between high-focus activities',
    impact: 'low',
    effort: 'low',
    category: 'Recovery',
    currentState: 'Back-to-back scheduling causing fatigue',
    recommendation: 'Add 15-minute breaks between major tasks',
    estimatedGain: '+10% sustained focus'
  }
]

const SCHEDULE_ANALYSIS = {
  overallEfficiency: 72,
  deepWorkOptimization: 65,
  energyAlignment: 80,
  taskBatching: 55,
  recoveryTime: 70,
  conflictResolution: 85
}

export function ScheduleOptimizer() {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) {return 'text-green-600'}
    if (score >= 60) {return 'text-yellow-600'}
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Schedule Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Schedule Analysis
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your current schedule efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overall Efficiency</span>
                <span className={`text-sm ${getEfficiencyColor(SCHEDULE_ANALYSIS.overallEfficiency)}`}>
                  {SCHEDULE_ANALYSIS.overallEfficiency}%
                </span>
              </div>
              <Progress value={SCHEDULE_ANALYSIS.overallEfficiency} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Deep Work Optimization</span>
                <span className={`text-sm ${getEfficiencyColor(SCHEDULE_ANALYSIS.deepWorkOptimization)}`}>
                  {SCHEDULE_ANALYSIS.deepWorkOptimization}%
                </span>
              </div>
              <Progress value={SCHEDULE_ANALYSIS.deepWorkOptimization} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Energy Alignment</span>
                <span className={`text-sm ${getEfficiencyColor(SCHEDULE_ANALYSIS.energyAlignment)}`}>
                  {SCHEDULE_ANALYSIS.energyAlignment}%
                </span>
              </div>
              <Progress value={SCHEDULE_ANALYSIS.energyAlignment} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Task Batching</span>
                <span className={`text-sm ${getEfficiencyColor(SCHEDULE_ANALYSIS.taskBatching)}`}>
                  {SCHEDULE_ANALYSIS.taskBatching}%
                </span>
              </div>
              <Progress value={SCHEDULE_ANALYSIS.taskBatching} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Recovery Time</span>
                <span className={`text-sm ${getEfficiencyColor(SCHEDULE_ANALYSIS.recoveryTime)}`}>
                  {SCHEDULE_ANALYSIS.recoveryTime}%
                </span>
              </div>
              <Progress value={SCHEDULE_ANALYSIS.recoveryTime} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Conflict Resolution</span>
                <span className={`text-sm ${getEfficiencyColor(SCHEDULE_ANALYSIS.conflictResolution)}`}>
                  {SCHEDULE_ANALYSIS.conflictResolution}%
                </span>
              </div>
              <Progress value={SCHEDULE_ANALYSIS.conflictResolution} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
          <CardDescription>
            Prioritized suggestions to improve your schedule efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {OPTIMIZATION_SUGGESTIONS
              .sort((a, b) => {
                const impactWeight = { high: 3, medium: 2, low: 1 }
                const effortWeight = { low: 3, medium: 2, high: 1 }
                const scoreA = impactWeight[a.impact as keyof typeof impactWeight] + effortWeight[a.effort as keyof typeof effortWeight]
                const scoreB = impactWeight[b.impact as keyof typeof impactWeight] + effortWeight[b.effort as keyof typeof effortWeight]
                return scoreB - scoreA
              })
              .map((suggestion) => (
              <Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{suggestion.title}</h3>
                        <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getImpactColor(suggestion.impact)}>
                          {suggestion.impact} impact
                        </Badge>
                        <Badge variant="outline">
                          {suggestion.effort} effort
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Current State</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.currentState}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Recommendation</h4>
                        <p className="text-sm text-muted-foreground">{suggestion.recommendation}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Expected Gain</h4>
                        <p className="text-sm font-semibold text-green-600">{suggestion.estimatedGain}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{suggestion.category}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Learn More</Button>
                        <Button size="sm">Apply Optimization</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Energy Pattern Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Energy Pattern Optimization
          </CardTitle>
          <CardDescription>
            Align your tasks with your natural energy rhythms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm">Peak Focus (9-11 AM)</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Academic deep work</p>
                  <p>• Complex problem solving</p>
                  <p>• Important decision making</p>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600">Optimized</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-sm">Mid Energy (2-4 PM)</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Meetings & calls</p>
                  <p>• Administrative tasks</p>
                  <p>• Email processing</p>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-yellow-600">Needs Work</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-sm">Evening Energy (5-7 PM)</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Workout sessions</p>
                  <p>• Creative projects</p>
                  <p>• Planning tomorrow</p>
                </div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-blue-600">Good</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Quick Wins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quick Wins (Implement Today)
          </CardTitle>
          <CardDescription>
            Simple changes you can make immediately for better productivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Block your peak hours (9-11 AM)</h4>
                <p className="text-sm text-muted-foreground">Reserve this time for your most important academic work. No meetings, no interruptions.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Add 15-minute buffers</h4>
                <p className="text-sm text-muted-foreground">Insert short breaks between major tasks to prevent mental fatigue and improve focus.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Batch similar tasks</h4>
                <p className="text-sm text-muted-foreground">Group emails, calls, and admin tasks into dedicated time blocks to reduce context switching.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Optimization Settings</CardTitle>
          <CardDescription>
            Let the system automatically optimize your schedule based on patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Automatic deep work blocking</h4>
                <p className="text-sm text-muted-foreground">Protect your peak hours automatically</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Smart task batching</h4>
                <p className="text-sm text-muted-foreground">Group similar tasks together</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Energy-based scheduling</h4>
                <p className="text-sm text-muted-foreground">Match task difficulty to energy levels</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}