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
import { mealEntrySchema } from '@/lib/validations'

// Avoid strict typing of Next.js context param

// GET /api/nutrition/meals/[id] - Get specific meal entry
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

    // Get meal entry
    const meal = await prisma.mealEntry.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!meal) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    return createSuccessResponse(meal)

  } catch (error) {
    console.error('Get meal error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/nutrition/meals/[id] - Update meal entry
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
      mealEntrySchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if meal exists and belongs to user
    const existingMeal = await prisma.mealEntry.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!existingMeal) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // If updating date or meal type, check for conflicts
    if (updateData?.date || updateData?.mealType) {
      const date = updateData?.date || existingMeal.date
      const mealType = updateData?.mealType || existingMeal.mealType

      const conflictingMeal = await prisma.mealEntry.findFirst({
        where: {
          userId: dbUser.id,
          date,
          mealType,
          id: { not: params.id }
        }
      })

      if (conflictingMeal) {
        return createErrorResponse(
          'Meal entry already exists for this date and type', 
          409
        )
      }
    }

    // Update meal entry
    const meal = await prisma.mealEntry.update({
      where: { id: params.id },
      data: {
        ...(typeof updateData?.date !== 'undefined' ? { date: updateData.date as any } : {}),
        ...(typeof updateData?.mealType !== 'undefined' ? { mealType: updateData.mealType as any } : {}),
        ...(typeof updateData?.notes !== 'undefined' ? { notes: updateData.notes } : {}),
      }
    })

    return createSuccessResponse(meal, 'Meal entry updated successfully')

  } catch (error) {
    console.error('Update meal error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/nutrition/meals/[id] - Delete meal entry
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

    // Check if meal exists and belongs to user
    const meal = await prisma.mealEntry.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!meal) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete meal entry
    await prisma.mealEntry.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Meal entry deleted successfully'
    )

  } catch (error) {
    console.error('Delete meal error:', error)
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