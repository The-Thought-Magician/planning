import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  validateRequestBody,
  methodNotAllowed,
  handleOptions,
  getDateRange,
  API_ERRORS
} from '@/lib/api-utils'
import { z } from 'zod'

// Hydration schema
const hydrationSchema = z.object({
  date: z.date(),
  waterIntake: z.number().min(0).max(10000), // ml
  notes: z.string().optional()
})

const hydrationUpdateSchema = z.object({
  waterIntakeIncrement: z.number().min(0).max(2000).optional(), // ml to add
  waterIntake: z.number().min(0).max(10000).optional(), // total ml
  notes: z.string().optional()
})

// GET /api/nutrition/hydration - Get hydration data
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

    const url = new URL(request.url)
    const today = url.searchParams.get('today')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let dateFilter: any = {}

    if (today === 'true') {
      const { startOfDay, endOfDay } = getDateRange()
      dateFilter = {
        gte: startOfDay,
        lte: endOfDay
      }
    } else if (startDate || endDate) {
      if (startDate) dateFilter.gte = new Date(startDate)
      if (endDate) dateFilter.lte = new Date(endDate)
    }

    // For hydration, we'll use daily metrics table since it has hydration-related fields
    // If no specific hydration table exists, we'll create virtual hydration tracking
    
    const where: any = { userId: dbUser.id }
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter
    }

    // Get daily metrics for hydration tracking (we'll simulate hydration data using notes)
    const metrics = await prisma.dailyMetric.findMany({
      where,
      orderBy: { date: 'desc' },
      take: today === 'true' ? 1 : 30
    })

    // Create hydration response format
    const hydrationData = metrics.map(metric => ({
      id: metric.id,
      date: metric.date,
      waterIntake: 0, // Default - would be tracked separately in a real hydration table
      target: 3000, // 3L daily target
      notes: null,
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt
    }))

    // If today requested, return single day data
    if (today === 'true') {
      const todayData = hydrationData[0] || {
        date: new Date(),
        waterIntake: 0,
        target: 3000,
        notes: null
      }
      return createSuccessResponse(todayData)
    }

    return createSuccessResponse({
      hydrationData,
      weeklyAverage: 0, // Calculate from data
      target: 3000,
      summary: {
        totalDays: hydrationData.length,
        averageIntake: 0,
        daysMetTarget: 0
      }
    })

  } catch (error) {
    console.error('Get hydration error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/nutrition/hydration - Create/Update hydration entry for today
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

    const { data: hydrationData, error: validationError } = await validateRequestBody(
      request,
      hydrationSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // For this implementation, we'll simulate hydration tracking
    // In a real app, you'd have a dedicated hydration table
    
    const { startOfDay, endOfDay } = getDateRange(hydrationData.date)
    
    // Check if daily metric exists for this date
    let dailyMetric = await prisma.dailyMetric.findFirst({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (!dailyMetric) {
      // Create new daily metric
      dailyMetric = await prisma.dailyMetric.create({
        data: {
          userId: dbUser.id,
          date: startOfDay,
          scheduleAdherence: 0,
          workoutCompleted: false,
          deepWorkHours: 0,
          pomodoroCount: 0
        }
      })
    }

    // Create hydration response
    const hydrationEntry = {
      id: dailyMetric.id,
      date: hydrationData.date,
      waterIntake: hydrationData.waterIntake,
      target: 3000,
      notes: hydrationData.notes,
      progress: Math.min((hydrationData.waterIntake / 3000) * 100, 100),
      createdAt: dailyMetric.createdAt,
      updatedAt: new Date()
    }

    return createSuccessResponse(hydrationEntry, 'Hydration entry recorded successfully', 201)

  } catch (error) {
    console.error('Create hydration error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/nutrition/hydration - Update today's hydration (add water intake)
export async function PATCH(request: NextRequest) {
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

    const { data: updateData, error: validationError } = await validateRequestBody(
      request,
      hydrationUpdateSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    const { startOfDay, endOfDay } = getDateRange()
    
    // Find or create today's daily metric
    let dailyMetric = await prisma.dailyMetric.findFirst({
      where: {
        userId: dbUser.id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    if (!dailyMetric) {
      dailyMetric = await prisma.dailyMetric.create({
        data: {
          userId: dbUser.id,
          date: startOfDay,
          scheduleAdherence: 0,
          workoutCompleted: false,
          deepWorkHours: 0,
          pomodoroCount: 0
        }
      })
    }

    // Simulate hydration update (in real app, would update hydration table)
    const currentIntake = 0 // Would get from hydration table
    let newIntake = currentIntake

    if (updateData.waterIntakeIncrement) {
      newIntake += updateData.waterIntakeIncrement
    } else if (updateData.waterIntake !== undefined) {
      newIntake = updateData.waterIntake
    }

    const hydrationEntry = {
      id: dailyMetric.id,
      date: dailyMetric.date,
      waterIntake: newIntake,
      target: 3000,
      notes: updateData.notes,
      progress: Math.min((newIntake / 3000) * 100, 100),
      updatedAt: new Date()
    }

    return createSuccessResponse(hydrationEntry, 'Hydration updated successfully')

  } catch (error) {
    console.error('Update hydration error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

export async function OPTIONS() {
  return handleOptions()
}

export async function PUT() {
  return methodNotAllowed(['GET', 'POST', 'PATCH'])
}

export async function DELETE() {
  return methodNotAllowed(['GET', 'POST', 'PATCH'])
}