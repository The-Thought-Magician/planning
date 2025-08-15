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
import { weeklyReviewSchema } from '@/lib/validations'

// GET /api/reviews - Get weekly reviews with filtering and pagination
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

    // Build filters
    const where: any = {
      userId: dbUser.id
    }

    // Date filtering
    if (startDate || endDate) {
      where.weekStarting = {}
      if (startDate) {where.weekStarting.gte = startDate}
      if (endDate) {where.weekStarting.lte = endDate}
    }

    // Get total count for pagination
    const total = await prisma.weeklyReview.count({ where })

    // Get weekly reviews
    const reviews = await prisma.weeklyReview.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return createPaginatedResponse(reviews, { page, limit, total })

  } catch (error) {
    console.error('Get reviews error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/reviews - Create a new weekly review
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
        weekStarting: reviewData!.weekStarting
      }
    })

    if (existingReview) {
      return createErrorResponse(
        'Weekly review already exists for this week', 
        409
      )
    }

    // Create weekly review
    const review = await prisma.weeklyReview.create({
      data: {
        weekStarting: reviewData!.weekStarting,
        workedWell: reviewData!.workedWell,
        challenges: reviewData!.challenges,
        improvements: reviewData!.improvements,
        overallRating: reviewData!.overallRating,
        notes: reviewData!.notes,
        userId: dbUser.id,
      }
    })

    return createSuccessResponse(review, 'Weekly review created successfully', 201)

  } catch (error) {
    console.error('Create review error:', error)
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