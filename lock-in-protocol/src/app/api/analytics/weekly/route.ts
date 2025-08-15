import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DailyMetric } from '@prisma/client'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  validateRequestBody,
  methodNotAllowed,
  handleOptions,
  getWeekRange,
  API_ERRORS
} from '@/lib/api-utils'
import { weeklyReviewSchema } from '@/lib/validations'

// GET /api/analytics/weekly - Get weekly review data and analytics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Get query parameters
    const url = new URL(request.url)
    const weekStarting = url.searchParams.get('weekStarting')
    const generate = url.searchParams.get('generate') // Generate analytics for current week

    let targetWeekStart: Date
    let targetWeekEnd: Date

    if (weekStarting) {
      targetWeekStart = new Date(weekStarting)
      targetWeekEnd = new Date(targetWeekStart)
      targetWeekEnd.setDate(targetWeekEnd.getDate() + 6)
      targetWeekEnd.setHours(23, 59, 59, 999)
    } else {
      const { startOfWeek, endOfWeek } = getWeekRange()
      targetWeekStart = startOfWeek
      targetWeekEnd = endOfWeek
    }

    // Get existing weekly review
    const existingReview = await prisma.weeklyReview.findFirst({
      where: {
        userId: dbUser.id,
        weekStarting: {
          gte: targetWeekStart,
          lt: new Date(targetWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // If generate flag is true or no existing review, generate analytics data
    if (generate === 'true' || !existingReview) {
      const weeklyAnalytics = await generateWeeklyAnalytics(dbUser.id, targetWeekStart, targetWeekEnd)
      
      const response = {
        weekStarting: targetWeekStart,
        weekEnding: targetWeekEnd,
        existingReview,
        analytics: weeklyAnalytics,
        suggestions: generateWeeklySuggestions(weeklyAnalytics)
      }
      
      return createSuccessResponse(response, 'Weekly analytics generated successfully')
    }

    // Return existing review with basic analytics
    const basicAnalytics = await generateWeeklyAnalytics(dbUser.id, targetWeekStart, targetWeekEnd)
    
    const response = {
      weekStarting: targetWeekStart,
      weekEnding: targetWeekEnd,
      review: existingReview,
      analytics: basicAnalytics
    }

    return createSuccessResponse(response, 'Weekly review data retrieved successfully')

  } catch (error) {
    console.error('Get weekly analytics error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/analytics/weekly - Create or update weekly review
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    // Find user in database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    })

    if (!dbUser) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

  const { data: reviewData, error: validationError } = await validateRequestBody(
      request,
      weeklyReviewSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if review already exists for this week
  const existingReview = await prisma.weeklyReview.findFirst({
      where: {
        userId: dbUser.id,
        weekStarting: {
      gte: reviewData!.weekStarting,
      lt: new Date(reviewData!.weekStarting.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    let review

    if (existingReview) {
      // Update existing review
      review = await prisma.weeklyReview.update({
        where: { id: existingReview.id },
        data: {
          weekStarting: reviewData!.weekStarting,
          workedWell: reviewData!.workedWell as any,
          challenges: reviewData!.challenges as any,
          improvements: reviewData!.improvements as any,
          overallRating: reviewData!.overallRating,
          notes: reviewData!.notes,
        }
      })
    } else {
      // Create new review
      review = await prisma.weeklyReview.create({
        data: {
          weekStarting: reviewData!.weekStarting,
          workedWell: reviewData!.workedWell as any,
          challenges: reviewData!.challenges as any,
          improvements: reviewData!.improvements as any,
          overallRating: reviewData!.overallRating,
          notes: reviewData!.notes,
          userId: dbUser.id
        }
      })
    }

    // Generate analytics for the reviewed week
  const weekEnd = new Date(reviewData!.weekStarting)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    
  const analytics = await generateWeeklyAnalytics(dbUser.id, reviewData!.weekStarting, weekEnd)

    const response = {
      review,
      analytics,
      insights: generateWeeklyInsights(review, analytics)
    }

    const message = existingReview ? 'Weekly review updated successfully' : 'Weekly review created successfully'
    const status = existingReview ? 200 : 201

    return createSuccessResponse(response, message, status)

  } catch (error) {
    console.error('Create/Update weekly review error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// Helper function to generate weekly analytics
async function generateWeeklyAnalytics(userId: string, weekStart: Date, weekEnd: Date) {
  const [
    timeBlocks,
    workouts,
    meals,
    supplements,
    dailyMetrics,
    milestones
  ] = await Promise.all([
    prisma.timeBlock.findMany({
      where: {
        userId,
        startTime: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    }),
    prisma.workoutSession.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      },
      include: {
        exercises: true
      }
    }),
    prisma.mealEntry.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    }),
    prisma.supplementLog.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    }),
    prisma.dailyMetric.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    }),
    prisma.milestone.findMany({
      where: {
        userId,
        updatedAt: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    })
  ])

  // Calculate weekly statistics
  const totalPomodoroCount = dailyMetrics.reduce((sum, m) => sum + m.pomodoroCount, 0)
  const totalDeepWorkHours = dailyMetrics.reduce((sum, m) => sum + m.deepWorkHours, 0)
  const averageScheduleAdherence = dailyMetrics.length > 0 
    ? dailyMetrics.reduce((sum, m) => sum + m.scheduleAdherence, 0) / dailyMetrics.length 
    : 0

  const analytics = {
    weekPeriod: {
      start: weekStart,
      end: weekEnd,
      totalDays: Math.ceil((weekEnd.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    },
    
    schedule: {
      totalTimeBlocks: timeBlocks.length,
      completedTimeBlocks: timeBlocks.filter(tb => tb.completed).length,
      adherenceRate: timeBlocks.length > 0 
        ? (timeBlocks.filter(tb => tb.completed).length / timeBlocks.length) * 100 
        : 0,
      averageScheduleAdherence: averageScheduleAdherence * 100,
      categoryBreakdown: getCategoryBreakdown(timeBlocks)
    },
    
    productivity: {
      totalPomodoroSessions: totalPomodoroCount,
      totalDeepWorkHours: totalDeepWorkHours,
      averagePomodorosPerDay: dailyMetrics.length > 0 
        ? totalPomodoroCount / dailyMetrics.length 
        : 0,
      averageDeepWorkPerDay: dailyMetrics.length > 0 
        ? totalDeepWorkHours / dailyMetrics.length 
        : 0,
      productivityScore: calculateWeeklyProductivityScore(dailyMetrics)
    },
    
    fitness: {
      workoutsPlanned: workouts.length,
      workoutsCompleted: workouts.filter(w => w.completed).length,
      completionRate: workouts.length > 0 
        ? (workouts.filter(w => w.completed).length / workouts.length) * 100 
        : 0,
      totalExercises: workouts.reduce((sum, w) => sum + w.exercises.length, 0),
      workoutTypeBreakdown: getWorkoutTypeBreakdown(workouts)
    },
    
    nutrition: {
      mealsPlanned: meals.length,
      mealsCompleted: meals.filter(m => m.completed).length,
      mealCompletionRate: meals.length > 0 
        ? (meals.filter(m => m.completed).length / meals.length) * 100 
        : 0,
      supplementsPlanned: supplements.length,
      supplementsCompleted: supplements.filter(s => s.completed).length,
      supplementCompletionRate: supplements.length > 0 
        ? (supplements.filter(s => s.completed).length / supplements.length) * 100 
        : 0
    },
    
    wellness: {
  averageSleepQuality: calculateAverage(dailyMetrics.map(m => m.sleepQuality).filter((v): v is number => v !== null)),
  averageEnergyLevel: calculateAverage(dailyMetrics.map(m => m.energyLevel).filter((v): v is number => v !== null)),
  averageStressLevel: calculateAverage(dailyMetrics.map(m => m.stressLevel).filter((v): v is number => v !== null)),
      wellnessScore: calculateWeeklyWellnessScore(dailyMetrics)
    },
    
    milestones: {
      milestonesUpdated: milestones.length,
      milestonesCompleted: milestones.filter(m => m.completed).length,
      averageProgress: milestones.length > 0 
        ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length 
        : 0
    },
    
    streaks: {
      workoutStreak: calculateStreak(workouts.map(w => ({ date: w.date, completed: w.completed }))),
      pomodoroStreak: calculateStreak(dailyMetrics.map(m => ({ date: m.date, completed: m.pomodoroCount > 0 }))),
      scheduleStreak: calculateStreak(dailyMetrics.map(m => ({ date: m.date, completed: m.scheduleAdherence > 0.7 })))
    }
  }

  return analytics
}

// Helper functions
function getCategoryBreakdown(timeBlocks: any[]) {
  const breakdown: Record<string, number> = {}
  timeBlocks.forEach(tb => {
    breakdown[tb.category] = (breakdown[tb.category] || 0) + 1
  })
  return breakdown
}

function getWorkoutTypeBreakdown(workouts: any[]) {
  const breakdown: Record<string, number> = {}
  workouts.forEach(w => {
    breakdown[w.type] = (breakdown[w.type] || 0) + 1
  })
  return breakdown
}

function calculateAverage(values: number[]): number {
  if (values.length === 0) {return 0}
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateWeeklyProductivityScore(metrics: DailyMetric[]): number {
  if (metrics.length === 0) {return 0}
  
  let totalScore = 0
  metrics.forEach(metric => {
    let dayScore = 0
    dayScore += metric.scheduleAdherence * 30
    dayScore += Math.min(metric.deepWorkHours / 8, 1) * 40
    dayScore += Math.min(metric.pomodoroCount / 10, 1) * 20
    dayScore += metric.workoutCompleted ? 10 : 0
    totalScore += dayScore
  })
  
  return totalScore / metrics.length
}

function calculateWeeklyWellnessScore(metrics: DailyMetric[]): number {
  if (metrics.length === 0) {return 0}
  
  let totalScore = 0
  let validEntries = 0
  
  metrics.forEach(metric => {
    let dayScore = 0
    let factors = 0
    
    if (metric.sleepQuality !== null) {
      dayScore += (metric.sleepQuality / 10) * 40
      factors += 40
    }
    
    if (metric.energyLevel !== null) {
      dayScore += (metric.energyLevel / 10) * 30
      factors += 30
    }
    
    if (metric.stressLevel !== null) {
      dayScore += ((10 - metric.stressLevel) / 10) * 30
      factors += 30
    }
    
    if (factors > 0) {
      totalScore += (dayScore / factors) * 100
      validEntries++
    }
  })
  
  return validEntries > 0 ? totalScore / validEntries : 0
}

function calculateStreak(items: { date: Date, completed: boolean }[]): number {
  if (items.length === 0) {return 0}
  
  // Sort by date
  items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  let currentStreak = 0
  let maxStreak = 0
  
  items.forEach(item => {
    if (item.completed) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  
  return maxStreak
}

function generateWeeklySuggestions(analytics: any): string[] {
  const suggestions: string[] = []
  
  // Schedule suggestions
  if (analytics.schedule.adherenceRate < 70) {
    suggestions.push("📅 Try breaking large time blocks into smaller, more manageable chunks")
  }
  
  // Productivity suggestions
  if (analytics.productivity.averagePomodorosPerDay < 6) {
    suggestions.push("🍅 Aim for at least 6 pomodoro sessions per day to maximize deep work")
  }
  
  // Fitness suggestions
  if (analytics.fitness.completionRate < 80) {
    suggestions.push("💪 Schedule workouts at consistent times to build routine")
  }
  
  // Wellness suggestions
  if (analytics.wellness.averageSleepQuality && analytics.wellness.averageSleepQuality < 7) {
    suggestions.push("😴 Focus on sleep hygiene to improve recovery and performance")
  }
  
  return suggestions
}

function generateWeeklyInsights(review: any, analytics: any): string[] {
  const insights: string[] = []
  
  // Overall rating insights
  if (review.overallRating >= 8) {
    insights.push("🌟 Excellent week! Your systems are working well.")
  } else if (review.overallRating >= 6) {
    insights.push("📈 Good progress. Focus on the areas that worked well.")
  } else {
    insights.push("🔄 Room for improvement. Consider adjusting your approach.")
  }
  
  // Productivity insights
  if (analytics.productivity.productivityScore > 70) {
    insights.push("🧠 Strong productivity week with consistent deep work.")
  }
  
  // Fitness insights
  if (analytics.fitness.completionRate > 80) {
    insights.push("💪 Great workout consistency! Your fitness discipline is paying off.")
  }
  
  return insights
}

export async function OPTIONS() {
  return handleOptions()
}

export async function PUT() {
  return methodNotAllowed(['GET', 'POST'])
}

export async function PATCH() {
  return methodNotAllowed(['GET', 'POST'])
}

export async function DELETE() {
  return methodNotAllowed(['GET', 'POST'])
}