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
import { supplementLogSchema } from '@/lib/validations'

// Avoid strict typing of Next.js context param

// GET /api/nutrition/supplements/[id] - Get specific supplement log
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

    // Get supplement log
    const supplement = await prisma.supplementLog.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!supplement) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    return createSuccessResponse(supplement)

  } catch (error) {
    console.error('Get supplement error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/nutrition/supplements/[id] - Update supplement log
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
      supplementLogSchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if supplement log exists and belongs to user
    const existingSupplement = await prisma.supplementLog.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!existingSupplement) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // If updating date, type, or timing, check for conflicts
    if (updateData?.date || updateData?.supplementType || updateData?.timing) {
      const date = updateData?.date || existingSupplement.date
      const supplementType = updateData?.supplementType || existingSupplement.supplementType
      const timing = updateData?.timing || existingSupplement.timing

      const conflictingSupplement = await prisma.supplementLog.findFirst({
        where: {
          userId: dbUser.id,
          date,
          supplementType,
          timing,
          id: { not: params.id }
        }
      })

      if (conflictingSupplement) {
        return createErrorResponse(
          'Supplement log already exists for this date, type, and timing', 
          409
        )
      }
    }

    // Update supplement log
    const supplement = await prisma.supplementLog.update({
      where: { id: params.id },
      data: {
        ...(typeof updateData?.date !== 'undefined' ? { date: updateData.date as any } : {}),
        ...(typeof updateData?.supplementType !== 'undefined' ? { supplementType: updateData.supplementType as any } : {}),
        ...(typeof updateData?.timing !== 'undefined' ? { timing: updateData.timing } : {}),
      }
    })

    return createSuccessResponse(supplement, 'Supplement log updated successfully')

  } catch (error) {
    console.error('Update supplement error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/nutrition/supplements/[id] - Delete supplement log
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

    // Check if supplement log exists and belongs to user
    const supplement = await prisma.supplementLog.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!supplement) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete supplement log
    await prisma.supplementLog.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Supplement log deleted successfully'
    )

  } catch (error) {
    console.error('Delete supplement error:', error)
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