import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  methodNotAllowed,
  handleOptions,
  getDateRange,
  getWeekRange,
  API_ERRORS
} from '@/lib/api-utils'

// GET /api/analytics/dashboard - Get dashboard analytics data
export async function GET(_request: NextRequest) {
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

    // Get date ranges
    const { startOfDay, endOfDay } = getDateRange()
    const { startOfWeek, endOfWeek } = getWeekRange()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get comprehensive analytics data
    const [
      // Today's metrics
      todayMetrics,
      
      // This week's data
      weeklyTimeBlocks,
      weeklyWorkouts,
      weeklyMeals,
      weeklySupplements,
      
      // Monthly data
      monthlyMetrics,
      monthlyMilestones,
      
      // Overall stats
      totalStats,
      
      // Recent activity
      recentTimeBlocks,
      recentWorkouts,
      
      // Weekly review data
      recentWeeklyReview
    ] = await Promise.all([
      // Today's metrics
      prisma.dailyMetric.findFirst({
        where: {
          userId: dbUser.id,
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      }),
      
      // This week's data
      prisma.timeBlock.findMany({
        where: {
          userId: dbUser.id,
          startTime: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),
      
      prisma.workoutSession.findMany({
        where: {
          userId: dbUser.id,
          date: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        },
        include: {
          exercises: true
        }
      }),
      
      prisma.mealEntry.findMany({
        where: {
          userId: dbUser.id,
          date: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),
      
      prisma.supplementLog.findMany({
        where: {
          userId: dbUser.id,
          date: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      }),
      
      // Monthly metrics
      prisma.dailyMetric.findMany({
        where: {
          userId: dbUser.id,
          date: {
            gte: thirtyDaysAgo
          }
        },
        orderBy: { date: 'desc' }
      }),
      
      prisma.milestone.findMany({
        where: {
          userId: dbUser.id,
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Total stats
      prisma.user.findUnique({
        where: { id: dbUser.id },
        include: {
          _count: {
            select: {
              timeBlocks: true,
              workoutSessions: true,
              mealEntries: true,
              supplementLogs: true,
              milestones: true,
              weeklyReviews: true,
              dailyMetrics: true
            }
          }
        }
      }),
      
      // Recent activity
      prisma.timeBlock.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      
      prisma.workoutSession.findMany({
        where: { userId: dbUser.id },
        orderBy: { date: 'desc' },
        take: 3,
        include: {
          exercises: true
        }
      }),
      
      // Most recent weekly review
      prisma.weeklyReview.findFirst({
        where: { userId: dbUser.id },
        orderBy: { weekStarting: 'desc' }
      })
    ])

    // Calculate dashboard metrics
    const dashboardData = {
      // Today's snapshot
      today: {
        date: new Date(),
        metrics: todayMetrics || {
          scheduleAdherence: 0,
          workoutCompleted: false,
          deepWorkHours: 0,
          pomodoroCount: 0,
          sleepQuality: null,
          energyLevel: null,
          stressLevel: null
        },
        completedTimeBlocks: weeklyTimeBlocks.filter(tb => 
          tb.startTime >= startOfDay && 
          tb.startTime <= endOfDay && 
          tb.completed
        ).length,
        totalTimeBlocks: weeklyTimeBlocks.filter(tb => 
          tb.startTime >= startOfDay && 
          tb.startTime <= endOfDay
        ).length
      },
      
      // Weekly overview
      thisWeek: {
        startDate: startOfWeek,
        endDate: endOfWeek,
        timeBlocks: {
          total: weeklyTimeBlocks.length,
          completed: weeklyTimeBlocks.filter(tb => tb.completed).length,
          adherenceRate: weeklyTimeBlocks.length > 0 
            ? (weeklyTimeBlocks.filter(tb => tb.completed).length / weeklyTimeBlocks.length) * 100 
            : 0
        },
        workouts: {
          total: weeklyWorkouts.length,
          completed: weeklyWorkouts.filter(w => w.completed).length,
          totalExercises: weeklyWorkouts.reduce((sum, w) => sum + w.exercises.length, 0)
        },
        nutrition: {
          mealsLogged: weeklyMeals.length,
          supplementsCompleted: weeklySupplements.filter(s => s.completed).length,
          nutritionScore: calculateNutritionScore(weeklyMeals, weeklySupplements)
        }
      },
      
      // Monthly trends
      monthlyTrends: {
        averageScheduleAdherence: monthlyMetrics.length > 0 
          ? monthlyMetrics.reduce((sum, m) => sum + m.scheduleAdherence, 0) / monthlyMetrics.length 
          : 0,
        averageDeepWorkHours: monthlyMetrics.length > 0 
          ? monthlyMetrics.reduce((sum, m) => sum + m.deepWorkHours, 0) / monthlyMetrics.length 
          : 0,
        averagePomodoroCount: monthlyMetrics.length > 0 
          ? monthlyMetrics.reduce((sum, m) => sum + m.pomodoroCount, 0) / monthlyMetrics.length 
          : 0,
        workoutConsistency: calculateWorkoutConsistency(monthlyMetrics),
        milestonesProgress: {
          total: monthlyMilestones.length,
          completed: monthlyMilestones.filter(m => m.completed).length,
          averageProgress: monthlyMilestones.length > 0 
            ? monthlyMilestones.reduce((sum, m) => sum + m.progress, 0) / monthlyMilestones.length 
            : 0
        }
      },
      
      // Overall statistics
      overallStats: {
        totalDays: Math.floor((new Date().getTime() - totalStats!.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        counts: totalStats!._count,
        completionRates: {
          timeBlocks: await calculateCompletionRate(dbUser.id, 'timeBlocks'),
          workouts: await calculateCompletionRate(dbUser.id, 'workouts'),
          milestones: await calculateCompletionRate(dbUser.id, 'milestones')
        }
      },
      
      // Recent activity
      recentActivity: {
        timeBlocks: recentTimeBlocks.map(tb => ({
          id: tb.id,
          title: tb.title,
          category: tb.category,
          completed: tb.completed,
          startTime: tb.startTime,
          endTime: tb.endTime
        })),
        workouts: recentWorkouts.map(w => ({
          id: w.id,
          type: w.type,
          date: w.date,
          completed: w.completed,
          exerciseCount: w.exercises.length
        }))
      },
      
      // Performance insights
      insights: generateInsights(monthlyMetrics, weeklyTimeBlocks, weeklyWorkouts),
      
      // Weekly review summary
      weeklyReviewSummary: recentWeeklyReview ? {
        weekStarting: recentWeeklyReview.weekStarting,
        overallRating: recentWeeklyReview.overallRating,
        workedWell: Array.isArray(recentWeeklyReview.workedWell) ? recentWeeklyReview.workedWell : [],
        needsImprovement: Array.isArray(recentWeeklyReview.improvements) ? recentWeeklyReview.improvements : []
      } : null
    }

    return createSuccessResponse(dashboardData, 'Dashboard data retrieved successfully')

  } catch (error) {
    console.error('Get dashboard analytics error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// Helper functions
function calculateNutritionScore(meals: Record<string, unknown>[], supplements: Record<string, unknown>[]): number {
  const mealScore = meals.filter((m) => {
    return m.completed
  }).length * 20
  const supplementScore = supplements.filter(s => s.completed).length * 10
  return Math.min(mealScore + supplementScore, 100)
}

function calculateWorkoutConsistency(metrics: Record<string, unknown>[]): number {
  if (metrics.length === 0) {return 0}
  const workoutDays = metrics.filter(m => m.workoutCompleted).length
  return (workoutDays / metrics.length) * 100
}

async function calculateCompletionRate(userId: string, type: string): Promise<number> {
  let completed = 0
  let total = 0
  
  switch (type) {
    case 'timeBlocks':
      const timeBlocks = await prisma.timeBlock.findMany({ where: { userId } })
      total = timeBlocks.length
      completed = timeBlocks.filter(tb => tb.completed).length
      break
    case 'workouts':
      const workouts = await prisma.workoutSession.findMany({ where: { userId } })
      total = workouts.length
      completed = workouts.filter(w => w.completed).length
      break
    case 'milestones':
      const milestones = await prisma.milestone.findMany({ where: { userId } })
      total = milestones.length
      completed = milestones.filter(m => m.completed).length
      break
  }
  
  return total > 0 ? (completed / total) * 100 : 0
}

function generateInsights(metrics: Record<string, unknown>[], _timeBlocks: Record<string, unknown>[], workouts: Record<string, unknown>[]): string[] {
  const insights: string[] = []
  
  // Schedule adherence insights
  const avgAdherence = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m.scheduleAdherence as number), 0) / metrics.length 
    : 0
  
  if (avgAdherence > 0.8) {
    insights.push("🎯 Excellent schedule adherence! You're staying on track consistently.")
  } else if (avgAdherence > 0.6) {
    insights.push("📈 Good schedule adherence. Consider identifying peak focus times.")
  } else {
    insights.push("⚠️ Schedule adherence could improve. Try blocking smaller time chunks.")
  }
  
  // Workout consistency insights
  const workoutRate = workouts.filter(w => w.completed).length / Math.max(workouts.length, 1)
  if (workoutRate > 0.8) {
    insights.push("💪 Fantastic workout consistency! Your discipline is paying off.")
  } else if (workoutRate > 0.5) {
    insights.push("🏃 Solid workout routine. Consider pre-planning your sessions.")
  } else {
    insights.push("🎯 Focus on workout consistency. Start with shorter sessions.")
  }
  
  // Deep work insights
  const avgDeepWork = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + (m.deepWorkHours as number), 0) / metrics.length 
    : 0
  
  if (avgDeepWork > 6) {
    insights.push("🧠 Outstanding deep work hours! You're maximizing productivity.")
  } else if (avgDeepWork > 3) {
    insights.push("📚 Good focus time. Try extending sessions gradually.")
  } else {
    insights.push("⏰ Increase deep work sessions. Start with 2-hour blocks.")
  }
  
  return insights
}

export async function OPTIONS() {
  return handleOptions()
}

export async function POST() {
  return methodNotAllowed(['GET'])
}

export async function PUT() {
  return methodNotAllowed(['GET'])
}

export async function PATCH() {
  return methodNotAllowed(['GET'])
}

export async function DELETE() {
  return methodNotAllowed(['GET'])
}