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
  API_ERRORS
} from '@/lib/api-utils'
import { workoutExerciseSchema } from '@/lib/validations'

// GET /api/exercises - Get exercises within workout sessions
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
    const sessionId = url.searchParams.get('sessionId')
    const exerciseName = url.searchParams.get('exerciseName')
    const completed = url.searchParams.get('completed')

    // Build filters
    const where: any = {
      session: {
        userId: dbUser.id
      }
    }

    if (sessionId) {
      where.sessionId = sessionId
    }

    if (exerciseName) {
      where.exerciseName = { contains: exerciseName, mode: 'insensitive' }
    }

    if (completed !== null) {
      where.completed = completed === 'true'
    }

    // Search filtering
    if (search) {
      where.OR = [
        { exerciseName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.workoutExercise.count({ where })

    // Get exercises with workout session info
    const exercises = await prisma.workoutExercise.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            date: true,
            type: true,
            completed: true
          }
        }
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    return createPaginatedResponse(exercises, { page, limit, total })

  } catch (error) {
    console.error('Get exercises error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/exercises - Add exercise to existing workout session
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

    const { data: exerciseData, error: validationError } = await validateRequestBody(
      request,
      workoutExerciseSchema.extend({
        sessionId: require('zod').string().cuid()
      })
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if workout session exists and belongs to user
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: exerciseData.sessionId,
        userId: dbUser.id
      }
    })

    if (!session) {
      return createErrorResponse('Workout session not found', 404)
    }

    // Check if exercise with same name already exists in this session
    const existingExercise = await prisma.workoutExercise.findFirst({
      where: {
        sessionId: exerciseData.sessionId,
        exerciseName: exerciseData.exerciseName
      }
    })

    if (existingExercise) {
      return createErrorResponse(
        'Exercise with this name already exists in the workout session', 
        409
      )
    }

    // Create exercise
    const exercise = await prisma.workoutExercise.create({
      data: {
        sessionId: exerciseData.sessionId,
        exerciseName: exerciseData.exerciseName,
        sets: exerciseData.sets,
        notes: exerciseData.notes
      },
      include: {
        session: {
          select: {
            id: true,
            date: true,
            type: true,
            completed: true
          }
        }
      }
    })

    return createSuccessResponse(exercise, 'Exercise added successfully', 201)

  } catch (error) {
    console.error('Create exercise error:', error)
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