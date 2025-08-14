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
import { workoutSessionSchema } from '@/lib/validations'

// GET /api/workouts - Get workout sessions with filtering and pagination
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
      where.date = {}
      if (startDate) where.date.gte = startDate
      if (endDate) where.date.lte = endDate
    }

    // Get query parameters for filtering
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const completed = url.searchParams.get('completed')

    if (type) {
      where.type = type
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    // Get total count for pagination
    const total = await prisma.workoutSession.count({ where })

    // Get workout sessions with exercises
    const workouts = await prisma.workoutSession.findMany({
      where,
      include: {
        exercises: {
          orderBy: { id: 'asc' }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return createPaginatedResponse(workouts, { page, limit, total })

  } catch (error) {
    console.error('Get workouts error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/workouts - Create a new workout session
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

    const { data: workoutData, error: validationError } = await validateRequestBody(
      request,
      workoutSessionSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if workout already exists for this date and type
    const existingWorkout = await prisma.workoutSession.findFirst({
      where: {
        userId: dbUser.id,
        date: workoutData.date,
        type: workoutData.type
      }
    })

    if (existingWorkout) {
      return createErrorResponse(
        'Workout of this type already exists for this date', 
        409
      )
    }

    // Separate exercises from workout data
    const { exercises, ...sessionData } = workoutData

    // Create workout session with exercises
    const workout = await prisma.workoutSession.create({
      data: {
        ...sessionData,
        userId: dbUser.id,
        exercises: {
          create: exercises.map(exercise => ({
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            notes: exercise.notes
          }))
        }
      },
      include: {
        exercises: {
          orderBy: { id: 'asc' }
        }
      }
    })

    return createSuccessResponse(workout, 'Workout session created successfully', 201)

  } catch (error) {
    console.error('Create workout error:', error)
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