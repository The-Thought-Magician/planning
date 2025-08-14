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
import { userSchema } from '@/lib/validations'

// GET /api/auth/user - Get current user profile
export async function GET() {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      include: {
        _count: {
          select: {
            timeBlocks: true,
            workoutSessions: true,
            milestones: true,
            dailyMetrics: true,
          }
        }
      }
    })

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
        },
        include: {
          _count: {
            select: {
              timeBlocks: true,
              workoutSessions: true,
              milestones: true,
              dailyMetrics: true,
            }
          }
        }
      })
    }

    return createSuccessResponse({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      stats: dbUser._count,
    })

  } catch (error) {
    console.error('Get user error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/auth/user - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    const { data: updateData, error: validationError } = await validateRequestBody(
      request,
      userSchema.partial()
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: user.email! },
      data: updateData,
      include: {
        _count: {
          select: {
            timeBlocks: true,
            workoutSessions: true,
            milestones: true,
            dailyMetrics: true,
          }
        }
      }
    })

    return createSuccessResponse({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      stats: updatedUser._count,
    }, 'Profile updated successfully')

  } catch (error) {
    console.error('Update user error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }
    
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

export async function OPTIONS() {
  return handleOptions()
}

export async function POST() {
  return methodNotAllowed(['GET', 'PATCH'])
}

export async function PUT() {
  return methodNotAllowed(['GET', 'PATCH'])
}

export async function DELETE() {
  return methodNotAllowed(['GET', 'PATCH'])
}