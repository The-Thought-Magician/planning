'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Calendar, Target, CheckCircle } from 'lucide-react'
import { MilestoneCategory } from '@prisma/client'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Goal {
  id: string
  title: string
  description: string
  category: MilestoneCategory
  progress: number
  targetDate?: Date
  priority: 'low' | 'medium' | 'high'
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  steps: GoalStep[]
}

interface GoalStep {
  id: string
  title: string
  completed: boolean
  order: number
}

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    title: 'Complete ME61011 Course with Excellence',
    description: 'Achieve top grades in all assignments and exams',
    category: MilestoneCategory.ACADEMIC_COURSEWORK,
    progress: 75,
    targetDate: new Date('2024-04-30'),
    priority: 'high',
    status: 'in_progress',
    steps: [
      { id: '1-1', title: 'Complete Assignment 1', completed: true, order: 1 },
      { id: '1-2', title: 'Complete Assignment 2', completed: true, order: 2 },
      { id: '1-3', title: 'Prepare for Mid-term', completed: true, order: 3 },
      { id: '1-4', title: 'Complete Final Project', completed: false, order: 4 }
    ]
  },
  {
    id: '2',
    title: 'Launch DentenSur V2.0',
    description: 'Deploy major updates with new features and improvements',
    category: MilestoneCategory.PROFESSIONAL_DENTENSUR,
    progress: 90,
    targetDate: new Date('2024-01-25'),
    priority: 'high',
    status: 'in_progress',
    steps: [
      { id: '2-1', title: 'Complete UI Redesign', completed: true, order: 1 },
      { id: '2-2', title: 'Implement New Features', completed: true, order: 2 },
      { id: '2-3', title: 'Testing & QA', completed: true, order: 3 },
      { id: '2-4', title: 'Deploy to Production', completed: false, order: 4 }
    ]
  },
  {
    id: '3',
    title: 'Bench Press 100kg',
    description: 'Achieve 100kg bench press with proper form',
    category: MilestoneCategory.FITNESS_STRENGTH,
    progress: 60,
    targetDate: new Date('2024-03-15'),
    priority: 'medium',
    status: 'in_progress',
    steps: [
      { id: '3-1', title: 'Consistent Training Schedule', completed: true, order: 1 },
      { id: '3-2', title: 'Progressive Overload Plan', completed: true, order: 2 },
      { id: '3-3', title: 'Reach 90kg', completed: false, order: 3 },
      { id: '3-4', title: 'Achieve 100kg Goal', completed: false, order: 4 }
    ]
  }
]

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS)
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory | 'all'>('all')
  const [showAddGoal, setShowAddGoal] = useState(false)

  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory)

  const updateStepCompletion = (goalId: string, stepId: string, completed: boolean) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.steps.map(step => 
          step.id === stepId ? { ...step, completed } : step
        )
        const completedSteps = updatedSteps.filter(step => step.completed).length
        const newProgress = (completedSteps / updatedSteps.length) * 100
        
        return {
          ...goal,
          steps: updatedSteps,
          progress: Math.round(newProgress),
          status: newProgress === 100 ? 'completed' : 'in_progress'
        }
      }
      return goal
    }))
    
    toast.success(completed ? 'Step completed!' : 'Step unchecked')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'in_progress': return 'text-blue-600'
      case 'paused': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Goal Tracker</CardTitle>
              <CardDescription>
                Manage and track progress on your goals
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.values(MilestoneCategory).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input placeholder="Goal title..." />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea placeholder="Describe your goal..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(MilestoneCategory).map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Target Date</Label>
                      <Input type="date" />
                    </div>
                    <Button className="w-full" onClick={() => setShowAddGoal(false)}>
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => (
          <Card key={goal.id} className={`border-l-4 border-l-${getPriorityColor(goal.priority).replace('bg-', '')}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                    <Badge variant="outline" className={getStatusColor(goal.status)}>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                  {goal.targetDate && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Due: {format(goal.targetDate, 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{goal.progress}%</div>
                  <Progress value={goal.progress} className="w-24 mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium">Action Steps</h4>
                <div className="space-y-2">
                  {goal.steps
                    .sort((a, b) => a.order - b.order)
                    .map(step => (
                    <div key={step.id} className={`flex items-center gap-3 p-2 rounded ${
                      step.completed ? 'bg-green-50 border border-green-200' : 'bg-muted/20'
                    }`}>
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={(checked) => 
                          updateStepCompletion(goal.id, step.id, checked as boolean)
                        }
                      />
                      <span className={`flex-1 ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </span>
                      {step.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGoals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No goals found for the selected category.</p>
            <Button className="mt-4" onClick={() => setShowAddGoal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}