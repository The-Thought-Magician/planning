import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
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
import { supplementLogSchema } from '@/lib/validations'

// GET /api/nutrition/supplements - Get supplement logs with filtering and pagination
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
    const supplementType = url.searchParams.get('supplementType')
    const completed = url.searchParams.get('completed')
    const today = url.searchParams.get('today')
    const timing = url.searchParams.get('timing')

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

    if (supplementType) {
      where.supplementType = supplementType
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    if (timing) {
      where.timing = { contains: timing, mode: 'insensitive' }
    }

    // Get total count for pagination
    const total = await prisma.supplementLog.count({ where })

    // Get supplement logs
    const supplements = await prisma.supplementLog.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return createPaginatedResponse(supplements, { page, limit, total })

  } catch (error) {
    console.error('Get supplements error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/nutrition/supplements - Create a new supplement log
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

    const { data: supplementData, error: validationError } = await validateRequestBody(
      request,
      supplementLogSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if supplement log already exists for this date, type, and timing
    const existingSupplement = await prisma.supplementLog.findFirst({
      where: {
        userId: dbUser.id,
        date: supplementData!.date,
        supplementType: supplementData!.supplementType,
        timing: supplementData!.timing
      }
    })

    if (existingSupplement) {
      return createErrorResponse(
        'Supplement log already exists for this date, type, and timing', 
        409
      )
    }

    // Create supplement log
    const supplement = await prisma.supplementLog.create({
      data: {
        date: supplementData!.date,
        supplementType: supplementData!.supplementType,
        timing: supplementData!.timing,
        userId: dbUser.id,
      }
    })

    return createSuccessResponse(supplement, 'Supplement log created successfully', 201)

  } catch (error) {
    console.error('Create supplement error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
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