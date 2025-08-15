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
import { milestoneSchema } from '@/lib/validations'

// Avoid strict typing of Next.js context param

// GET /api/milestones/[id] - Get specific milestone
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

    // Get milestone
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!milestone) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Add computed fields
    const milestoneWithComputed = {
      ...milestone,
      isOverdue: milestone.targetDate && milestone.targetDate < new Date() && !milestone.completed,
      daysUntilTarget: milestone.targetDate 
        ? Math.ceil((milestone.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : null,
      progressPercentage: milestone.progress
    }

    return createSuccessResponse(milestoneWithComputed)

  } catch (error) {
    console.error('Get milestone error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/milestones/[id] - Update milestone
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
      milestoneSchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if milestone exists and belongs to user
    const existingMilestone = await prisma.milestone.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!existingMilestone) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Auto-complete milestone if progress reaches 100%
    if (updateData?.progress === 100 && updateData && !Object.prototype.hasOwnProperty.call(updateData, 'completed')) {
      ;(updateData as any).completed = true
    }

    // Update milestone
    const milestone = await prisma.milestone.update({
      where: { id: params.id },
      data: {
        ...(typeof updateData?.title !== 'undefined' ? { title: updateData.title } : {}),
        ...(typeof updateData?.description !== 'undefined' ? { description: updateData.description } : {}),
        ...(typeof updateData?.targetDate !== 'undefined' ? { targetDate: updateData.targetDate as any } : {}),
        ...(typeof updateData?.progress !== 'undefined' ? { progress: updateData.progress } : {}),
        ...(typeof updateData?.category !== 'undefined' ? { category: updateData.category as any } : {}),
        ...(typeof (updateData as any)?.completed !== 'undefined' ? { completed: (updateData as any).completed } : {}),
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

    return createSuccessResponse(milestoneWithComputed, 'Milestone updated successfully')

  } catch (error) {
    console.error('Update milestone error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/milestones/[id] - Delete milestone
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

    // Check if milestone exists and belongs to user
    const milestone = await prisma.milestone.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id
      }
    })

    if (!milestone) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete milestone
    await prisma.milestone.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Milestone deleted successfully'
    )

  } catch (error) {
    console.error('Delete milestone error:', error)
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