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
import { z } from 'zod'

// Habit update schema
const habitUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetCount: z.number().min(1).optional(),
})

// Note: Avoid typing the context param strictly; Next.js validates runtime shape

// GET /api/habits/[id] - Get specific habit
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

    // Get habit (from milestones table)
    const habit = await prisma.milestone.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id,
        category: 'PERSONAL_HABITS'
      }
    })

    if (!habit) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Transform to habit format with streak calculation
    const currentStreak = Math.floor(habit.progress / 10) // Simplified calculation
    
    const habitResponse = {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      frequency: 'daily', // Default frequency
      targetCount: 1,
      currentStreak,
      bestStreak: currentStreak + Math.floor(Math.random() * 10), // Simulated
      completedToday: false, // Would check today's log
      totalCompletions: Math.floor(habit.progress * 2), // Simplified
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt
    }

    return createSuccessResponse(habitResponse)

  } catch (error) {
    console.error('Get habit error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// PATCH /api/habits/[id] - Update habit or log completion
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

    const body = await request.json()
    
    // Check if this is a completion log
    if (body.logCompletion) {
      // Log habit completion for today
      const habit = await prisma.milestone.findFirst({
        where: {
          id: params.id,
          userId: dbUser.id,
          category: 'PERSONAL_HABITS'
        }
      })

      if (!habit) {
        return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
      }

      // Increment progress (simplified habit tracking)
      const newProgress = Math.min(habit.progress + 10, 100) // Each completion adds 10%
      
      const updatedHabit = await prisma.milestone.update({
        where: { id: params.id },
        data: { 
          progress: newProgress,
          updatedAt: new Date()
        }
      })

      const currentStreak = Math.floor(newProgress / 10)
      
      const habitResponse = {
        id: updatedHabit.id,
        title: updatedHabit.title,
        description: updatedHabit.description,
        frequency: 'daily',
        targetCount: 1,
        currentStreak,
        bestStreak: currentStreak + Math.floor(Math.random() * 10),
        completedToday: true,
        totalCompletions: Math.floor(newProgress * 2),
        createdAt: updatedHabit.createdAt,
        updatedAt: updatedHabit.updatedAt
      }

      return createSuccessResponse(habitResponse, 'Habit completion logged successfully')
    }

    // Regular habit update
  const { data: updateData, error: validationError } = await validateRequestBody(
      request,
      habitUpdateSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Check if habit exists and belongs to user
    const existingHabit = await prisma.milestone.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id,
        category: 'PERSONAL_HABITS'
      }
    })

    if (!existingHabit) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Update habit (only title and description in milestones table)
  const updatePayload: any = {}
  if (updateData?.title) {updatePayload.title = updateData.title}
  if (updateData?.description) {updatePayload.description = updateData.description}

    const habit = await prisma.milestone.update({
      where: { id: params.id },
      data: updatePayload
    })

    const currentStreak = Math.floor(habit.progress / 10)
    
    const habitResponse = {
      id: habit.id,
      title: habit.title,
      description: habit.description,
  frequency: updateData?.frequency || 'daily',
  targetCount: updateData?.targetCount || 1,
      currentStreak,
      bestStreak: currentStreak + Math.floor(Math.random() * 10),
      completedToday: false,
      totalCompletions: Math.floor(habit.progress * 2),
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt
    }

    return createSuccessResponse(habitResponse, 'Habit updated successfully')

  } catch (error) {
    console.error('Update habit error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// DELETE /api/habits/[id] - Delete habit
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

    // Check if habit exists and belongs to user
    const habit = await prisma.milestone.findFirst({
      where: {
        id: params.id,
        userId: dbUser.id,
        category: 'PERSONAL_HABITS'
      }
    })

    if (!habit) {
      return createErrorResponse(API_ERRORS.NOT_FOUND, 404)
    }

    // Delete habit
    await prisma.milestone.delete({
      where: { id: params.id }
    })

    return createSuccessResponse(
      { id: params.id },
      'Habit deleted successfully'
    )

  } catch (error) {
    console.error('Delete habit error:', error)
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