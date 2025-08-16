import { NextRequest } from 'next/server'
import { withDatabaseFallback } from '@/lib/prisma'
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

// GET /api/dashboard-consolidated - Get all dashboard data in one call
export async function GET(_request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    // Find user in database with fallback support
    const dbUser = await withDatabaseFallback(async (prisma) => {
      return await prisma.user.findUnique({
        where: { email: user.email! }
      })
    })

    if (!dbUser) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Get date ranges
    const { startOfDay, endOfDay } = getDateRange()
    const { startOfWeek, endOfWeek } = getWeekRange()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get all data in parallel for maximum performance
    const [
      // Dashboard analytics
      todayMetrics,
      weeklyTimeBlocks,
      weeklyWorkouts,
      monthlyMetrics,
      totalStats,
      recentTimeBlocks,
      
      // Daily metrics
      dailyMetrics,
      
      // Time blocks for today
      todayTimeBlocks,
      
      // Milestones
      milestones,
      
      // Recent activities
      recentWorkouts,
      recentMeals,
    ] = await Promise.all([
      // Dashboard analytics data
      withDatabaseFallback(async (prisma) => 
        prisma.dailyMetric.findFirst({
          where: {
            userId: dbUser.id,
            date: { gte: startOfDay, lte: endOfDay }
          }
        })
      ),
      
      withDatabaseFallback(async (prisma) => 
        prisma.timeBlock.findMany({
          where: {
            userId: dbUser.id,
            startTime: { gte: startOfWeek, lte: endOfWeek }
          }
        })
      ),
      
      withDatabaseFallback(async (prisma) => 
        prisma.workoutSession.findMany({
          where: {
            userId: dbUser.id,
            date: { gte: startOfWeek, lte: endOfWeek }
          },
          include: { exercises: true }
        })
      ),
      
      withDatabaseFallback(async (prisma) => 
        prisma.dailyMetric.findMany({
          where: {
            userId: dbUser.id,
            date: { gte: thirtyDaysAgo }
          },
          orderBy: { date: 'desc' },
          take: 30
        })
      ),
      
      withDatabaseFallback(async (prisma) => 
        prisma.user.findUnique({
          where: { id: dbUser.id },
          include: {
            _count: {
              select: {
                timeBlocks: true,
                workoutSessions: true,
                dailyMetrics: true
              }
            }
          }
        })
      ),
      
      withDatabaseFallback(async (prisma) => 
        prisma.timeBlock.findMany({
          where: { userId: dbUser.id },
          orderBy: { createdAt: 'desc' },
          take: 5
        })
      ),
      
      // Daily metrics (same as todayMetrics but separate for consistency)
      withDatabaseFallback(async (prisma) => 
        prisma.dailyMetric.findFirst({
          where: {
            userId: dbUser.id,
            date: { gte: startOfDay, lte: endOfDay }
          }
        })
      ),
      
      // Time blocks for today
      withDatabaseFallback(async (prisma) => 
        prisma.timeBlock.findMany({
          where: {
            userId: dbUser.id,
            startTime: { gte: startOfDay, lte: endOfDay }
          },
          orderBy: { startTime: 'asc' }
        })
      ),
      
      // Milestones (used for both habits tracking and achievements)
      withDatabaseFallback(async (prisma) => 
        prisma.milestone.findMany({
          where: { 
            userId: dbUser.id
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ),
      
      // Recent workouts
      withDatabaseFallback(async (prisma) => 
        prisma.workoutSession.findMany({
          where: { userId: dbUser.id },
          orderBy: { date: 'desc' },
          take: 3,
          include: { exercises: true }
        })
      ),
      
      // Recent meals
      withDatabaseFallback(async (prisma) => 
        prisma.mealEntry.findMany({
          where: { userId: dbUser.id },
          orderBy: { date: 'desc' },
          take: 3
        })
      ),
    ])

    // Consolidate all data
    const consolidatedData = {
      // Dashboard analytics
      dashboard: {
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
          }
        },
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
        },
        overallStats: {
          totalDays: Math.floor((new Date().getTime() - totalStats!.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          counts: totalStats!._count
        },
        recentActivity: {
          timeBlocks: recentTimeBlocks.map(tb => ({
            id: tb.id,
            title: tb.title,
            category: tb.category,
            completed: tb.completed,
            startTime: tb.startTime,
            endTime: tb.endTime
          }))
        }
      },
      
      // Daily metrics
      dailyMetrics,
      
      // Time blocks for today
      timeBlocks: todayTimeBlocks,
      
      // Milestones (includes habits and achievements)
      milestones,
      
      // Weekly analytics (simplified)
      weeklyAnalytics: {
        workouts: recentWorkouts,
        meals: recentMeals,
        adherenceRate: weeklyTimeBlocks.length > 0 
          ? (weeklyTimeBlocks.filter(tb => tb.completed).length / weeklyTimeBlocks.length) * 100 
          : 0
      }
    }

    return createSuccessResponse(consolidatedData, 'Consolidated dashboard data retrieved successfully')

  } catch (error) {
    console.error('Get consolidated dashboard data error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
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