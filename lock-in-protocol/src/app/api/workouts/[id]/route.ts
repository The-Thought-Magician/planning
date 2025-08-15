import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  validateRequestBody,
  methodNotAllowed,
  handleOptions,
  API_ERRORS
} from '@/lib/api-utils'
import { workoutSessionSchema } from '@/lib/validations'

// Avoid strict typing of Next.js context param

// GET /api/workouts/[id] - Get specific workout session
export async function GET(
  _request: NextRequest,
  { params }: any
) {
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

    // Get workout session with exercises
    const workout = await prisma.workoutSession.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      },
      include: {
        exercises: {
          orderBy: { id: 'asc' }
        }
      }
    })

    if (!workout) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    return createSuccessResponse(workout)

  } catch (error) {
    console.error('Get workout error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/workouts/[id] - Update workout session
export async function PATCH(
  request: NextRequest,
  { params }: any
) {
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
      workoutSessionSchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if workout exists and belongs to user
    const existingWorkout = await prisma.workoutSession.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      },
      include: {
        exercises: true
      }
    })

    if (!existingWorkout) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Separate exercises from workout data
  const { exercises, ...sessionData } = updateData || {}

    // Start transaction for updating workout and exercises
    const workout = await prisma.$transaction(async (tx) => {
      // Update workout session
      await tx.workoutSession.update({
        where: { id: params.id },
        data: {
          ...(typeof sessionData?.date !== 'undefined' ? { date: sessionData.date as any } : {}),
          ...(typeof sessionData?.type !== 'undefined' ? { type: sessionData.type as any } : {}),
          ...(typeof sessionData?.duration !== 'undefined' ? { duration: sessionData.duration } : {}),
          ...(typeof sessionData?.notes !== 'undefined' ? { notes: sessionData.notes } : {}),
          ...(typeof (sessionData as any)?.completed !== 'undefined' ? { completed: (sessionData as any).completed } : {}),
        }
      })

      // If exercises are provided, update them
  if (exercises) {
        // Delete existing exercises
        await tx.workoutExercise.deleteMany({
          where: { sessionId: params.id }
        })

        // Create new exercises
  await tx.workoutExercise.createMany({
          data: exercises.map(exercise => ({
            sessionId: params.id,
            exerciseName: exercise.exerciseName,
            sets: exercise.sets,
            notes: exercise.notes
          }))
        })
      }

      // Return updated workout with exercises
      return await tx.workoutSession.findUnique({
        where: { id: params.id },
        include: {
          exercises: {
            orderBy: { id: 'asc' }
          }
        }
      })
    })

    return createSuccessResponse(workout, 'Workout session updated successfully')

  } catch (error) {
    console.error('Update workout error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/workouts/[id] - Delete workout session
export async function DELETE(
  _request: NextRequest,
  { params }: any
) {
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

    // Check if workout exists and belongs to user
    const workout = await prisma.workoutSession.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!workout) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete workout session (exercises will be deleted by cascade)
    await prisma.workoutSession.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Workout session deleted successfully'
    )

  } catch (error) {
    console.error('Delete workout error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

export async function OPTIONS() {
  return handleOptions()
}

export async function POST() {
  return methodNotAllowed(['GET', 'PATCH', 'DELETE'])
}

export async function PUT() {
  return methodNotAllowed(['GET', 'PATCH', 'DELETE'])
}