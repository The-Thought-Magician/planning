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
import { mealEntrySchema } from '@/lib/validations'

// GET /api/nutrition/meals - Get meal entries with filtering and pagination
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
    const mealType = url.searchParams.get('mealType')
    const completed = url.searchParams.get('completed')
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

    if (mealType) {
      where.mealType = mealType
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    // Get total count for pagination
    const total = await prisma.mealEntry.count({ where })

    // Get meal entries
    const meals = await prisma.mealEntry.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return createPaginatedResponse(meals, { page, limit, total })

  } catch (error) {
    console.error('Get meals error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/nutrition/meals - Create a new meal entry
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

    const { data: mealData, error: validationError } = await validateRequestBody(
      request,
      mealEntrySchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if meal entry already exists for this date and type
    const existingMeal = await prisma.mealEntry.findFirst({
      where: {
        userId: dbUser.id,
        date: mealData!.date,
        mealType: mealData!.mealType
      }
    })

    if (existingMeal) {
      return createErrorResponse(
        'Meal entry already exists for this date and type', 
        409
      )
    }

    // Create meal entry
    const meal = await prisma.mealEntry.create({
      data: {
        date: mealData!.date,
        mealType: mealData!.mealType,
        notes: mealData!.notes,
        userId: dbUser.id,
      }
    })

    return createSuccessResponse(meal, 'Meal entry created successfully', 201)

  } catch (error) {
    console.error('Create meal error:', error)
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