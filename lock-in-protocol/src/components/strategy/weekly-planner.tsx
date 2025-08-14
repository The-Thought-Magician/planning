'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, Target, Plus, Edit, Save } from 'lucide-react'
import { format, startOfWeek, addDays } from 'date-fns'

interface WeeklyTask {
  id: string
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  estimatedHours: number
  deadline?: Date
  completed: boolean
  day?: string
}

interface WeekPlan {
  weekStarting: Date
  theme: string
  objectives: string[]
  tasks: WeeklyTask[]
  notes: string
}

const TASK_CATEGORIES = [
  'Academic Coursework',
  'Professional Projects', 
  'Fitness Training',
  'Personal Development',
  'Social & Family',
  'Maintenance & Chores'
]

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
]

export function WeeklyPlanner() {
  const [currentWeek, setCurrentWeek] = useState<WeekPlan>({
    weekStarting: startOfWeek(new Date()),
    theme: 'Focus on Academic Excellence & Project Delivery',
    objectives: [
      'Complete ME61011 Assignment 3',
      'Deploy DentenSur V2 features',
      'Maintain workout consistency',
      'Prepare for upcoming exams'
    ],
    tasks: [
      {
        id: '1',
        title: 'ME61011 Assignment 3 - Research & Analysis',
        category: 'Academic Coursework',
        priority: 'high',
        estimatedHours: 6,
        deadline: new Date('2024-01-20'),
        completed: false,
        day: 'Monday'
      },
      {
        id: '2',
        title: 'DentenSur Feature Testing',
        category: 'Professional Projects',
        priority: 'high',
        estimatedHours: 4,
        completed: false,
        day: 'Tuesday'
      },
      {
        id: '3',
        title: 'Upper Body Workout',
        category: 'Fitness Training',
        priority: 'medium',
        estimatedHours: 1.5,
        completed: true,
        day: 'Monday'
      }
    ],
    notes: 'Focus on deep work blocks in the morning. Schedule meetings after 2 PM.'
  })

  const [isEditing, setIsEditing] = useState(false)
  const [newTask, setNewTask] = useState<Partial<WeeklyTask>>({})

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Academic Coursework': 'bg-blue-100 text-blue-800',
      'Professional Projects': 'bg-green-100 text-green-800',
      'Fitness Training': 'bg-red-100 text-red-800',
      'Personal Development': 'bg-purple-100 text-purple-800',
      'Social & Family': 'bg-pink-100 text-pink-800',
      'Maintenance & Chores': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTasksByDay = (day: string) => {
    return currentWeek.tasks.filter(task => task.day === day)
  }

  const getTotalHoursByDay = (day: string) => {
    return getTasksByDay(day).reduce((sum, task) => sum + task.estimatedHours, 0)
  }

  const addNewTask = () => {
    if (!newTask.title || !newTask.category) return

    const task: WeeklyTask = {
      id: Date.now().toString(),
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority || 'medium',
      estimatedHours: newTask.estimatedHours || 1,
      deadline: newTask.deadline,
      completed: false,
      day: newTask.day
    }

    setCurrentWeek(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }))

    setNewTask({})
  }

  const toggleTaskCompletion = (taskId: string) => {
    setCurrentWeek(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }))
  }

  return (
    <div className="space-y-6">
      {/* Week Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Week of {format(currentWeek.weekStarting, 'MMM dd, yyyy')}
              </CardTitle>
              <CardDescription>{currentWeek.theme}</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit Plan'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Week Theme */}
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Week Theme</label>
                <Input
                  value={currentWeek.theme}
                  onChange={(e) => setCurrentWeek(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="What's the main focus this week?"
                />
              </div>
            ) : (
              <div>
                <h4 className="font-medium mb-1">Week Theme</h4>
                <p className="text-muted-foreground">{currentWeek.theme}</p>
              </div>
            )}

            {/* Objectives */}
            <div>
              <h4 className="font-medium mb-2">Key Objectives</h4>
              <div className="space-y-1">
                {currentWeek.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{objective}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Planning Notes</label>
                <Textarea
                  value={currentWeek.notes}
                  onChange={(e) => setCurrentWeek(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any important notes or considerations..."
                  rows={2}
                />
              </div>
            ) : currentWeek.notes && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{currentWeek.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Daily Planning Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {DAYS_OF_WEEK.map((day, dayIndex) => {
          const dayTasks = getTasksByDay(day)
          const totalHours = getTotalHoursByDay(day)
          const isWeekend = dayIndex >= 5

          return (
            <Card key={day} className={`${isWeekend ? 'bg-muted/20' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{day}</span>
                  <Badge variant="outline" className="text-xs">
                    {totalHours}h
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {format(addDays(currentWeek.weekStarting, dayIndex), 'MMM dd')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-2 border rounded text-xs ${
                      task.completed ? 'opacity-60 line-through' : ''
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task.id)}
                        className="w-3 h-3"
                      />
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    </div>
                    <p className="font-medium mb-1">{task.title}</p>
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getCategoryColor(task.category)}`}>
                        {task.category.replace(' ', '')}
                      </Badge>
                      <span className="text-muted-foreground">{task.estimatedHours}h</span>
                    </div>
                  </div>
                ))}

                {/* Add Task */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full h-8 text-xs"
                  onClick={() => setNewTask(prev => ({ ...prev, day }))}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add New Task Modal/Form */}
      {newTask.day && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Task for {newTask.day}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input
                  value={newTask.title || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What needs to be done?"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newTask.category || ''}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTask.priority || 'medium'}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value as 'high' | 'medium' | 'low' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={newTask.estimatedHours || 1}
                  onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={addNewTask}>Add Task</Button>
              <Button variant="outline" onClick={() => setNewTask({})}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Week Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Week Summary</CardTitle>
          <CardDescription>Overview of planned workload and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Tasks</p>
              <p className="text-2xl font-bold">{currentWeek.tasks.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {currentWeek.tasks.filter(t => t.completed).length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Total Hours</p>
              <p className="text-2xl font-bold">
                {currentWeek.tasks.reduce((sum, task) => sum + task.estimatedHours, 0)}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {currentWeek.tasks.filter(t => t.priority === 'high').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}