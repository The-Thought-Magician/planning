'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Wand2, ArrowRight, CheckCircle } from 'lucide-react'
import { MilestoneCategory } from '@prisma/client'

interface GoalWizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

interface GoalFormData {
  title: string
  description: string
  category: MilestoneCategory | ''
  priority: 'low' | 'medium' | 'high'
  timeframe: string
  targetDate: string
  success_criteria: string[]
  obstacles: string[]
  resources: string[]
  steps: string[]
}

const WIZARD_STEPS: GoalWizardStep[] = [
  { id: 'basics', title: 'Goal Basics', description: 'Define what you want to achieve', completed: false },
  { id: 'specifics', title: 'Make it Specific', description: 'Add details and success criteria', completed: false },
  { id: 'planning', title: 'Planning', description: 'Break down into actionable steps', completed: false },
  { id: 'obstacles', title: 'Obstacles & Resources', description: 'Anticipate challenges and prepare', completed: false },
  { id: 'review', title: 'Review & Commit', description: 'Final review and goal creation', completed: false }
]

const GOAL_TEMPLATES = [
  {
    title: 'Academic Excellence',
    description: 'Achieve top performance in coursework',
    category: MilestoneCategory.ACADEMIC_GRADES,
    success_criteria: ['Maintain 9+ CGPA', 'Complete all assignments on time', 'Active participation in class'],
    timeframe: '1 semester'
  },
  {
    title: 'Professional Project Launch',
    description: 'Successfully launch a new project or feature',
    category: MilestoneCategory.PROFESSIONAL_DENTENSUR,
    success_criteria: ['Complete development', 'Deploy to production', 'Positive user feedback'],
    timeframe: '3 months'
  },
  {
    title: 'Fitness Transformation',
    description: 'Achieve significant fitness improvements',
    category: MilestoneCategory.FITNESS_STRENGTH,
    success_criteria: ['Increase strength by 20%', 'Improve body composition', 'Consistent workout routine'],
    timeframe: '6 months'
  },
  {
    title: 'Skill Mastery',
    description: 'Master a new professional or personal skill',
    category: MilestoneCategory.PERSONAL_SKILLS,
    success_criteria: ['Complete structured learning', 'Apply in real projects', 'Teach others'],
    timeframe: '4 months'
  }
]

export function GoalWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [goalData, setGoalData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    timeframe: '',
    targetDate: '',
    success_criteria: [],
    obstacles: [],
    resources: [],
    steps: []
  })
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  const updateGoalData = (
    field: keyof GoalFormData,
    value: GoalFormData[keyof GoalFormData]
  ) => {
    setGoalData(prev => ({ ...prev, [field]: value }))
  }

  const addListItem = (field: keyof Pick<GoalFormData, 'success_criteria' | 'obstacles' | 'resources' | 'steps'>, item: string) => {
    if (!item.trim()) return
    setGoalData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), item.trim()]
    }))
  }

  const removeListItem = (field: keyof Pick<GoalFormData, 'success_criteria' | 'obstacles' | 'resources' | 'steps'>, index: number) => {
    setGoalData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const applyTemplate = (templateIndex: number) => {
    const template = GOAL_TEMPLATES[templateIndex]
    setGoalData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      category: template.category,
      timeframe: template.timeframe,
      success_criteria: [...template.success_criteria]
    }))
    setSelectedTemplate(templateIndex)
  }

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Goal Setting Wizard
          </CardTitle>
          <CardDescription>
            Step-by-step guidance to create meaningful, achievable goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {WIZARD_STEPS.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            
            <div className="flex items-center gap-2 overflow-x-auto">
              {WIZARD_STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                    index <= currentStep ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <span className="w-4 h-4 text-center font-medium">{index + 1}</span>
                    )}
                    <span className="whitespace-nowrap">{step.title}</span>
                  </div>
                  {index < WIZARD_STEPS.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{WIZARD_STEPS[currentStep].title}</CardTitle>
          <CardDescription>{WIZARD_STEPS[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Goal Basics */}
          {currentStep === 0 && (
            <div className="space-y-6">
              {/* Templates */}
              <div className="space-y-3">
                <h3 className="font-medium">Choose a Template (Optional)</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {GOAL_TEMPLATES.map((template, index) => (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate === index ? 'bg-blue-50 border-blue-200' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => applyTemplate(index)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium">{template.title}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {template.timeframe}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={goalData.title}
                    onChange={(e) => updateGoalData('title', e.target.value)}
                    placeholder="What do you want to achieve?"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={goalData.description}
                    onChange={(e) => updateGoalData('description', e.target.value)}
                    placeholder="Describe your goal in more detail..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={goalData.category} onValueChange={(value) => updateGoalData('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(MilestoneCategory).map(category => (
                          <SelectItem key={category} value={category}>
                            {category.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={goalData.priority} onValueChange={(value) => updateGoalData('priority', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Make it Specific */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Input
                    id="timeframe"
                    value={goalData.timeframe}
                    onChange={(e) => updateGoalData('timeframe', e.target.value)}
                    placeholder="e.g., 3 months, 1 semester"
                  />
                </div>
                <div>
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={goalData.targetDate}
                    onChange={(e) => updateGoalData('targetDate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Success Criteria</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  How will you know when you&apos;ve achieved this goal?
                </p>
                <div className="space-y-2">
                  {goalData.success_criteria.map((criterion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="flex-1 text-sm">{criterion}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeListItem('success_criteria', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a success criterion..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addListItem('success_criteria', e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input')
                        if (input) {
                          addListItem('success_criteria', input.value)
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Continue with other steps... */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Action Steps</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Break down your goal into specific, actionable steps
                </p>
                <div className="space-y-2">
                  {goalData.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <span className="flex-1 text-sm">{step}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeListItem('steps', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an action step..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addListItem('steps', e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    <Button
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input')
                        if (input) {
                          addListItem('steps', input.value)
                          input.value = ''
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Previous
            </Button>
            <Button onClick={nextStep} disabled={currentStep === WIZARD_STEPS.length - 1}>
              {currentStep === WIZARD_STEPS.length - 1 ? 'Create Goal' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}