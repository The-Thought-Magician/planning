'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Briefcase, Dumbbell, User, Target, TrendingUp, Calendar, Plus } from 'lucide-react'
import { MilestoneCategory } from '@prisma/client'

interface CategoryProgress {
  category: MilestoneCategory
  name: string
  icon: React.ReactNode
  color: string
  totalGoals: number
  completedGoals: number
  inProgressGoals: number
  averageProgress: number
  recentMilestones: string[]
  nextDeadline?: string
}

const CATEGORY_DATA: CategoryProgress[] = [
  {
    category: MilestoneCategory.ACADEMIC_COURSEWORK,
    name: 'Academic Coursework',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-blue-500',
    totalGoals: 6,
    completedGoals: 2,
    inProgressGoals: 3,
    averageProgress: 65,
    recentMilestones: ['Complete ME61011 Assignment 3', 'Prepare for Mid-term Exams'],
    nextDeadline: '2024-01-20'
  },
  {
    category: MilestoneCategory.ACADEMIC_GRADES,
    name: 'Academic Performance',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-indigo-500',
    totalGoals: 4,
    completedGoals: 1,
    inProgressGoals: 2,
    averageProgress: 45,
    recentMilestones: ['Achieve 9+ CGPA', 'Excel in Core Subjects'],
    nextDeadline: '2024-02-15'
  },
  {
    category: MilestoneCategory.PROFESSIONAL_DENTENSUR,
    name: 'DentenSur Project',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-green-500',
    totalGoals: 8,
    completedGoals: 5,
    inProgressGoals: 2,
    averageProgress: 80,
    recentMilestones: ['Deploy V2 Updates', 'Client Feedback Integration'],
    nextDeadline: '2024-01-25'
  },
  {
    category: MilestoneCategory.PROFESSIONAL_NURTUREBEAST,
    name: 'NurtureBeast Development',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-emerald-500',
    totalGoals: 5,
    completedGoals: 2,
    inProgressGoals: 3,
    averageProgress: 60,
    recentMilestones: ['Feature Enhancement', 'User Experience Optimization'],
    nextDeadline: '2024-01-30'
  },
  {
    category: MilestoneCategory.PROFESSIONAL_AI_BARD,
    name: 'AI/Bard Integration',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-purple-500',
    totalGoals: 3,
    completedGoals: 1,
    inProgressGoals: 1,
    averageProgress: 40,
    recentMilestones: ['API Integration Research', 'Prototype Development'],
    nextDeadline: '2024-02-10'
  },
  {
    category: MilestoneCategory.FITNESS_STRENGTH,
    name: 'Strength Goals',
    icon: <Dumbbell className="h-5 w-5" />,
    color: 'bg-red-500',
    totalGoals: 4,
    completedGoals: 1,
    inProgressGoals: 3,
    averageProgress: 55,
    recentMilestones: ['Bench Press 80kg', 'Deadlift 120kg'],
    nextDeadline: '2024-03-01'
  },
  {
    category: MilestoneCategory.FITNESS_PHYSIQUE,
    name: 'Physique Goals',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-orange-500',
    totalGoals: 3,
    completedGoals: 0,
    inProgressGoals: 2,
    averageProgress: 30,
    recentMilestones: ['Body Fat Reduction', 'Muscle Mass Increase'],
    nextDeadline: '2024-04-01'
  },
  {
    category: MilestoneCategory.PERSONAL_HABITS,
    name: 'Personal Habits',
    icon: <User className="h-5 w-5" />,
    color: 'bg-pink-500',
    totalGoals: 5,
    completedGoals: 3,
    inProgressGoals: 2,
    averageProgress: 75,
    recentMilestones: ['Daily Morning Routine', 'Consistent Sleep Schedule'],
    nextDeadline: '2024-02-01'
  },
  {
    category: MilestoneCategory.PERSONAL_SKILLS,
    name: 'Skill Development',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'bg-teal-500',
    totalGoals: 4,
    completedGoals: 1,
    inProgressGoals: 2,
    averageProgress: 35,
    recentMilestones: ['Learn Advanced React Patterns', 'Improve Problem Solving'],
    nextDeadline: '2024-02-20'
  }
]

export function MilestoneProgress() {
  const [selectedCategory, setSelectedCategory] = useState<MilestoneCategory | null>(null)

  const totalGoals = CATEGORY_DATA.reduce((sum, cat) => sum + cat.totalGoals, 0)
  const completedGoals = CATEGORY_DATA.reduce((sum, cat) => sum + cat.completedGoals, 0)
  const inProgressGoals = CATEGORY_DATA.reduce((sum, cat) => sum + cat.inProgressGoals, 0)
  const overallProgress = (completedGoals / totalGoals) * 100

  const getStatusColor = (progress: number) => {
    if (progress >= 80) {return 'text-green-600'}
    if (progress >= 60) {return 'text-blue-600'}
    if (progress >= 40) {return 'text-yellow-600'}
    return 'text-red-600'
  }

  const getPriorityCategories = () => {
    return CATEGORY_DATA
      .filter(cat => cat.averageProgress < 50 && cat.inProgressGoals > 0)
      .sort((a, b) => a.averageProgress - b.averageProgress)
      .slice(0, 3)
  }

  const getTopPerformingCategories = () => {
    return CATEGORY_DATA
      .filter(cat => cat.averageProgress >= 70)
      .sort((a, b) => b.averageProgress - a.averageProgress)
      .slice(0, 3)
  }

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <Progress value={overallProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(overallProgress)}% overall completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
            <p className="text-xs text-muted-foreground">goals achieved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressGoals}</div>
            <p className="text-xs text-muted-foreground">active goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CATEGORY_DATA.length}</div>
            <p className="text-xs text-muted-foreground">tracked areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progress by Category</CardTitle>
              <CardDescription>
                Track your advancement across different life areas
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CATEGORY_DATA.map((category, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-${category.color.replace('bg-', '')}`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.category ? null : category.category
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`${category.color} p-2 rounded-lg text-white`}>
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{category.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {category.totalGoals} goals
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(category.averageProgress)}>
                      {Math.round(category.averageProgress)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Progress value={category.averageProgress} className="h-2" />
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-green-600">{category.completedGoals}</div>
                        <div className="text-muted-foreground">Done</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{category.inProgressGoals}</div>
                        <div className="text-muted-foreground">Active</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-600">
                          {category.totalGoals - category.completedGoals - category.inProgressGoals}
                        </div>
                        <div className="text-muted-foreground">Pending</div>
                      </div>
                    </div>

                    {selectedCategory === category.category && (
                      <div className="mt-3 p-3 bg-muted/20 rounded-lg space-y-2">
                        <h4 className="font-medium text-xs">Recent Milestones:</h4>
                        {category.recentMilestones.map((milestone, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            • {milestone}
                          </div>
                        ))}
                        {category.nextDeadline && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs text-muted-foreground">
                              Next deadline: {category.nextDeadline}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Areas & Top Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Priority Areas</CardTitle>
            <CardDescription>
              Categories that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPriorityCategories().length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Great job! No priority areas need immediate attention.
                </p>
              ) : (
                getPriorityCategories().map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center gap-3">
                      <div className={`${category.color} p-2 rounded text-white`}>
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.inProgressGoals} goals active
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-red-600">
                      {Math.round(category.averageProgress)}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Top Performers</CardTitle>
            <CardDescription>
              Categories with excellent progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopPerformingCategories().length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Work on your goals to see top performers here!
                </p>
              ) : (
                getTopPerformingCategories().map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className={`${category.color} p-2 rounded text-white`}>
                        {category.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.completedGoals}/{category.totalGoals} completed
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      {Math.round(category.averageProgress)}%
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}