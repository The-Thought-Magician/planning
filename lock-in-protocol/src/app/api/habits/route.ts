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
import { z } from 'zod'

// Habit schema (extending milestones for habit tracking)
const habitSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  targetCount: z.number().min(1).default(1),
})

const habitLogSchema = z.object({
  habitId: z.string().cuid(),
  date: z.date(),
  completed: z.boolean().default(true),
  notes: z.string().optional()
})

// GET /api/habits - Get habits (using milestones table with habit category)
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
    const frequency = url.searchParams.get('frequency')
    const active = url.searchParams.get('active')

    // Build filters - using milestones table for habits
    const where: any = {
      userId: dbUser.id,
      category: 'PERSONAL_HABITS' // Using this category for habits
    }

    // Search filtering
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (active === 'true') {
      where.completed = false // Active habits are not completed
    }

    // Get total count for pagination
    const total = await prisma.milestone.count({ where })

    // Get habits (from milestones table)
    const habits = await prisma.milestone.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Transform to habit format with streak calculation
    const habitsWithStreaks = habits.map(habit => {
      // Calculate current streak (simplified - in real app would track daily completions)
      const currentStreak = Math.floor(habit.progress / 10) // Simplified calculation
      
      return {
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
    })

    return createPaginatedResponse(habitsWithStreaks, { page, limit, total })

  } catch (error) {
    console.error('Get habits error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/habits - Create a new habit
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

    const { data: habitData, error: validationError } = await validateRequestBody(
      request,
      habitSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // Create habit using milestones table
    const habit = await prisma.milestone.create({
      data: {
        userId: dbUser.id,
        category: 'PERSONAL_HABITS',
        title: habitData.title,
        description: habitData.description,
        progress: 0,
        completed: false
      }
    })

    // Transform to habit format
    const habitResponse = {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      frequency: habitData.frequency,
      targetCount: habitData.targetCount,
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      totalCompletions: 0,
      createdAt: habit.createdAt,
      updatedAt: habit.updatedAt
    }

    return createSuccessResponse(habitResponse, 'Habit created successfully', 201)

  } catch (error) {
    console.error('Create habit error:', error)
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