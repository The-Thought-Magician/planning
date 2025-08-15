import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DailyMetric } from '@prisma/client'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  createPaginatedResponse,
  validateRequestBody,
  methodNotAllowed,
  handleOptions,
  getQueryParams,
  getDateRange,
  API_ERRORS
} from '@/lib/api-utils'
import { dailyMetricSchema } from '@/lib/validations'

// GET /api/metrics - Get daily metrics with filtering
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

    const { 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      startDate, 
      endDate 
    } = getQueryParams(request.url)

    // Get query parameters
    const url = new URL(request.url)
    const today = url.searchParams.get('today')

    // Build filters
    const where: any = {
      userId: dbUser.id
    }

    // Date filtering
    if (today === 'true') {
      const { startOfDay, endOfDay } = getDateRange()
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    } else if (startDate || endDate) {
      where.date = {}
      if (startDate) {where.date.gte = startDate}
      if (endDate) {where.date.lte = endDate}
    }

    // Get total count for pagination
    const total = await prisma.dailyMetric.count({ where })

    // Get daily metrics
    const metrics = await prisma.dailyMetric.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    // If today requested, return single day data or create default
    if (today === 'true') {
      const todayMetric = metrics[0]
      
      if (!todayMetric) {
        // Create default metric for today
        const { startOfDay } = getDateRange()
        const defaultMetric = await prisma.dailyMetric.create({
          data: {
            userId: dbUser.id,
            date: startOfDay,
            scheduleAdherence: 0,
            workoutCompleted: false,
            deepWorkHours: 0,
            pomodoroCount: 0
          }
        })
        return createSuccessResponse(defaultMetric)
      }
      
      return createSuccessResponse(todayMetric)
    }

    // Add computed fields for metrics
    const metricsWithComputed = metrics.map(metric => ({
      ...metric,
      productivityScore: calculateProductivityScore(metric),
      wellnessScore: calculateWellnessScore(metric)
    }))

    return createPaginatedResponse(metricsWithComputed, { page, limit, total })

  } catch (error) {
    console.error('Get metrics error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/metrics - Create or update daily metric
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

  const { data: metricData, error: validationError } = await validateRequestBody(
      request,
      dailyMetricSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

  const { startOfDay, endOfDay } = getDateRange(metricData!.date)

    // Check if metric already exists for this date
    const existingMetric = await prisma.dailyMetric.findFirst({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    let metric

    if (existingMetric) {
      // Update existing metric
      metric = await prisma.dailyMetric.update({
        where: { id: existingMetric.id },
        data: {
          date: metricData!.date,
          scheduleAdherence: metricData!.scheduleAdherence,
          workoutCompleted: metricData!.workoutCompleted,
          deepWorkHours: metricData!.deepWorkHours,
          sleepQuality: metricData!.sleepQuality,
          energyLevel: metricData!.energyLevel,
          stressLevel: metricData!.stressLevel,
          pomodoroCount: metricData!.pomodoroCount,
        }
      })
    } else {
      // Create new metric
      metric = await prisma.dailyMetric.create({
        data: {
          userId: dbUser.id,
          date: startOfDay,
          scheduleAdherence: metricData!.scheduleAdherence,
          workoutCompleted: metricData!.workoutCompleted,
          deepWorkHours: metricData!.deepWorkHours,
          sleepQuality: metricData!.sleepQuality,
          energyLevel: metricData!.energyLevel,
          stressLevel: metricData!.stressLevel,
          pomodoroCount: metricData!.pomodoroCount,
        }
      })
    }

    // Add computed fields
    const metricWithComputed = {
      ...metric,
      productivityScore: calculateProductivityScore(metric),
      wellnessScore: calculateWellnessScore(metric)
    }

    const message = existingMetric ? 'Daily metric updated successfully' : 'Daily metric created successfully'
    const status = existingMetric ? 200 : 201

    return createSuccessResponse(metricWithComputed, message, status)

  } catch (error) {
    console.error('Create/Update metric error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// Helper functions
function calculateProductivityScore(metric: DailyMetric): number {
  let score = 0
  
  // Schedule adherence (40%)
  score += metric.scheduleAdherence * 40
  
  // Deep work hours (30%)
  const deepWorkScore = Math.min(metric.deepWorkHours / 8, 1) * 30
  score += deepWorkScore
  
  // Pomodoro count (20%)
  const pomodoroScore = Math.min(metric.pomodoroCount / 10, 1) * 20
  score += pomodoroScore
  
  // Workout completion (10%)
  if (metric.workoutCompleted) {
    score += 10
  }
  
  return Math.round(score)
}

function calculateWellnessScore(metric: DailyMetric): number {
  let score = 0
  let factors = 0
  
  if (metric.sleepQuality !== null && metric.sleepQuality !== undefined) {
    score += (metric.sleepQuality / 10) * 40
    factors += 40
  }
  
  if (metric.energyLevel !== null && metric.energyLevel !== undefined) {
    score += (metric.energyLevel / 10) * 30
    factors += 30
  }
  
  if (metric.stressLevel !== null && metric.stressLevel !== undefined) {
    // Inverse stress level (lower stress = higher wellness)
    score += ((10 - metric.stressLevel) / 10) * 30
    factors += 30
  }
  
  // Normalize score based on available factors
  if (factors === 0) {return 0}
  return Math.round((score / factors) * 100)
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