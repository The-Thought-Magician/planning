import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
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
import { timeBlockSchema } from '@/lib/validations'

// GET /api/time-blocks - Get time blocks with filtering and pagination
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
      endDate,
      search 
    } = getQueryParams(request.url)

    // Build filters
    const where: any = {
      userId: dbUser.id
    }

    // Date filtering
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = startDate
      if (endDate) where.startTime.lte = endDate
    }

    // Search filtering
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.timeBlock.count({ where })

    // Get time blocks
    const timeBlocks = await prisma.timeBlock.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return createPaginatedResponse(timeBlocks, { page, limit, total })

  } catch (error) {
    console.error('Get time blocks error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/time-blocks - Create a new time block
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

    const { data: timeBlockData, error: validationError } = await validateRequestBody(
      request,
      timeBlockSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check for overlapping time blocks
    const overlapping = await prisma.timeBlock.findFirst({
      where: {
        userId: dbUser.id,
        OR: [
          {
            AND: [
              { startTime: { lte: timeBlockData.startTime } },
              { endTime: { gt: timeBlockData.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: timeBlockData.endTime } },
              { endTime: { gte: timeBlockData.endTime } }
            ]
          }
        ]
      }
    })

    if (overlapping) {
      return createErrorResponse(
        'Time block overlaps with existing block', 
        409
      )
    }

    // Create time block
    const timeBlock = await prisma.timeBlock.create({
      data: {
        ...timeBlockData,
        userId: dbUser.id,
      }
    })

    return createSuccessResponse(timeBlock, 'Time block created successfully', 201)

  } catch (error) {
    console.error('Create time block error:', error)
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