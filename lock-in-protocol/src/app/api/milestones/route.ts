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
  API_ERRORS
} from '@/lib/api-utils'
import { milestoneSchema } from '@/lib/validations'

// GET /api/milestones - Get milestones with filtering and pagination
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
      search
    } = getQueryParams(request.url)

    // Get query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const completed = url.searchParams.get('completed')
    const overdue = url.searchParams.get('overdue')

    // Build filters
    const where: any = {
      userId: dbUser.id
    }

    if (category) {
      where.category = category
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    if (overdue === 'true') {
      where.targetDate = {
        lt: new Date()
      }
      where.completed = false
    }

    // Search filtering
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.milestone.count({ where })

    // Get milestones
    const milestones = await prisma.milestone.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Add computed fields
    const milestonesWithComputed = milestones.map(milestone => ({
      ...milestone,
      isOverdue: milestone.targetDate && milestone.targetDate < new Date() && !milestone.completed,
      daysUntilTarget: milestone.targetDate 
        ? Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
      progressPercentage: milestone.progress
    }))

    return createPaginatedResponse(milestonesWithComputed, { page, limit, total })

  } catch (error) {
    console.error('Get milestones error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/milestones - Create a new milestone
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

    const { data: milestoneData, error: validationError } = await validateRequestBody(
      request,
      milestoneSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Create milestone
    const milestone = await prisma.milestone.create({
      data: {
        category: milestoneData!.category,
        title: milestoneData!.title,
        description: milestoneData!.description,
        targetDate: milestoneData!.targetDate,
        progress: milestoneData!.progress,
        userId: dbUser.id,
      }
    })

    // Add computed fields
    const milestoneWithComputed = {
      ...milestone,
      isOverdue: milestone.targetDate && milestone.targetDate < new Date() && !milestone.completed,
      daysUntilTarget: milestone.targetDate 
        ? Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
      progressPercentage: milestone.progress
    }

    return createSuccessResponse(milestoneWithComputed, 'Milestone created successfully', 201)

  } catch (error) {
    console.error('Create milestone error:', error)
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