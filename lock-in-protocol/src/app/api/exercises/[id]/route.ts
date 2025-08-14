import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  validateRequestBody,
  methodNotAllowed,
  handleOptions,
  API_ERRORS
} from '@/lib/api-utils'
import { workoutExerciseSchema } from '@/lib/validations'

interface RouteParams {
  params: { id: string }
}

// PATCH /api/exercises/[id] - Update specific exercise
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
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
      workoutExerciseSchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if exercise exists and belongs to user's workout
    const existingExercise = await prisma.workoutExercise.findFirst({
      where: {
        id: params.id,
        session: {
          userId: dbUser.id
        }
      },
      include: {
        session: {
          select: {
            id: true,
            userId: true,
            date: true,
            type: true
          }
        }
      }
    })

    if (!existingExercise) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // If updating exercise name, check for duplicates in the same session
    if (updateData.exerciseName && updateData.exerciseName !== existingExercise.exerciseName) {
      const duplicateExercise = await prisma.workoutExercise.findFirst({
        where: {
          sessionId: existingExercise.sessionId,
          exerciseName: updateData.exerciseName,
          id: { not: params.id }
        }
      })

      if (duplicateExercise) {
        return createErrorResponse(
          'Exercise with this name already exists in the workout session', 
          409
        )
      }
    }

    // Update exercise
    const exercise = await prisma.workoutExercise.update({
      where: { id: params.id },
      data: updateData,
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

    return createSuccessResponse(exercise, 'Exercise updated successfully')

  } catch (error) {
    console.error('Update exercise error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/exercises/[id] - Delete exercise
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
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

    // Check if exercise exists and belongs to user's workout
    const exercise = await prisma.workoutExercise.findFirst({
      where: {
        id: params.id,
        session: {
          userId: dbUser.id
        }
      }
    })

    if (!exercise) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete exercise
    await prisma.workoutExercise.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Exercise deleted successfully'
    )

  } catch (error) {
    console.error('Delete exercise error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

export async function OPTIONS() {
  return handleOptions()
}

export async function GET() {
  return methodNotAllowed(['PATCH', 'DELETE'])
}

export async function POST() {
  return methodNotAllowed(['PATCH', 'DELETE'])
}

export async function PUT() {
  return methodNotAllowed(['PATCH', 'DELETE'])
}