'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Dumbbell, 
  UtensilsCrossed, 
  NotebookPen, 
  Timer,
  Plus,
  CheckCircle,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  {
    id: 'start-pomodoro',
    title: 'Start Pomodoro',
    description: '25-minute focus session',
    icon: Timer,
    color: 'bg-orange-500 hover:bg-orange-600',
    action: 'start-timer',
  },
  {
    id: 'log-workout',
    title: 'Log Workout',
    description: 'Record today\'s session',
    icon: Dumbbell,
    color: 'bg-red-500 hover:bg-red-600',
    href: '/workout',
  },
  {
    id: 'track-meal',
    title: 'Track Meal',
    description: 'Log nutrition intake',
    icon: UtensilsCrossed,
    color: 'bg-green-500 hover:bg-green-600',
    href: '/nutrition',
  },
  {
    id: 'add-notes',
    title: 'Add Notes',
    description: 'Quick reflection',
    icon: NotebookPen,
    color: 'bg-blue-500 hover:bg-blue-600',
    action: 'add-note',
  },
  {
    id: 'schedule-time',
    title: 'Edit Schedule',
    description: 'Adjust time blocks',
    icon: Calendar,
    color: 'bg-purple-500 hover:bg-purple-600',
    href: '/calendar',
  },
  {
    id: 'complete-activity',
    title: 'Mark Complete',
    description: 'Finish current block',
    icon: CheckCircle,
    color: 'bg-emerald-500 hover:bg-emerald-600',
    action: 'complete-current',
  },
]

const upcomingTasks = [
  {
    id: '1',
    title: 'Review DSA Problems',
    time: '10:30 AM',
    category: 'Deep Work',
    priority: 'high',
  },
  {
    id: '2',
    title: 'ME61011 Assignment',
    time: '2:30 PM',
    category: 'Class Work',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Upper Body Workout',
    time: '4:30 PM',
    category: 'Fitness',
    priority: 'high',
  },
]

export function QuickActions() {
  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'start-timer':
        // This would integrate with the pomodoro timer component
        console.log('Starting pomodoro timer...')
        break
      case 'add-note':
        // This would open a note-taking modal
        console.log('Opening notes interface...')
        break
      case 'complete-current':
        // This would mark the current activity as complete
        console.log('Marking current activity as complete...')
        break
      default:
        console.log('Unknown action:', actionType)
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Fast-track your Lock-In Protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              
              if (action.href) {
                return (
                  <Link key={action.id} href={action.href}>
                    <Button
                      variant="outline"
                      className={`h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200 ${action.color} text-white border-0`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <div className="text-center">
                        <div className="text-sm font-medium">{action.title}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </Button>
                  </Link>
                )
              }

              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-center space-y-2 hover:scale-105 transition-all duration-200 ${action.color} text-white border-0`}
                  onClick={() => handleAction(action.action!)}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <CardDescription>Next activities in your schedule</CardDescription>
            </div>
            <Link href="/calendar">
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{task.title}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        task.priority === 'high' 
                          ? 'border-red-200 text-red-700' 
                          : 'border-yellow-200 text-yellow-700'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.category}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{task.time}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}