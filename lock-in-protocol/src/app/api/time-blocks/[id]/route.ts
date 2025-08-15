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
import { timeBlockSchema } from '@/lib/validations'

// Avoid strict typing of Next.js context param

// GET /api/time-blocks/[id] - Get specific time block
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

    // Get time block
    const timeBlock = await prisma.timeBlock.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!timeBlock) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    return createSuccessResponse(timeBlock)

  } catch (error) {
    console.error('Get time block error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/time-blocks/[id] - Update time block
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
      timeBlockSchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if time block exists and belongs to user
    const existingTimeBlock = await prisma.timeBlock.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!existingTimeBlock) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // If updating time, check for overlaps (excluding current block)
    if (updateData?.startTime || updateData?.endTime) {
      const startTime = updateData?.startTime || existingTimeBlock.startTime
      const endTime = updateData?.endTime || existingTimeBlock.endTime

      const overlapping = await prisma.timeBlock.findFirst({
        where: {
          userId: dbUser.id,
          id: { not: params.id }, // Exclude current block
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } }
              ]
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } }
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
    }

    // Update time block
    const timeBlock = await prisma.timeBlock.update({
      where: { id: params.id },
      data: {
        ...(typeof updateData?.title !== 'undefined' ? { title: updateData.title } : {}),
        ...(typeof updateData?.description !== 'undefined' ? { description: updateData.description } : {}),
        ...(typeof updateData?.startTime !== 'undefined' ? { startTime: updateData.startTime as any } : {}),
        ...(typeof updateData?.endTime !== 'undefined' ? { endTime: updateData.endTime as any } : {}),
        ...(typeof updateData?.category !== 'undefined' ? { category: updateData.category as any } : {}),
        ...(typeof updateData?.notes !== 'undefined' ? { notes: updateData.notes } : {}),
        ...(typeof updateData?.pomodoroCount !== 'undefined' ? { pomodoroCount: updateData.pomodoroCount } : {}),
      }
    })

    return createSuccessResponse(timeBlock, 'Time block updated successfully')

  } catch (error) {
    console.error('Update time block error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/time-blocks/[id] - Delete time block
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

    // Check if time block exists and belongs to user
    const timeBlock = await prisma.timeBlock.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!timeBlock) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete time block
    await prisma.timeBlock.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Time block deleted successfully'
    )

  } catch (error) {
    console.error('Delete time block error:', error)
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