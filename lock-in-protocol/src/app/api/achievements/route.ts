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
import { z } from 'zod'

// Achievement schema
const achievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  badge: z.string().min(1, 'Badge is required'),
  category: z.string().min(1, 'Category is required'),
  unlockedAt: z.date().optional(),
})

// GET /api/achievements - Get achievements and badges
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

    const { page, limit, sortBy, sortOrder } = getQueryParams(request.url)

    // Get query parameters
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const unlocked = url.searchParams.get('unlocked')

    // Define achievement system based on Lock-In Protocol goals
    const allAchievements = [
      // Fitness Achievements
      {
        id: 'first_workout',
        title: 'First Step',
        description: 'Complete your first workout session',
        badge: '💪',
        category: 'fitness',
        requirement: 'Complete 1 workout',
        points: 10
      },
      {
        id: 'week_consistency',
        title: 'Weekly Warrior',
        description: 'Complete all 4 workouts in a week',
        badge: '🔥',
        category: 'fitness',
        requirement: 'Complete 4 workouts in 7 days',
        points: 50
      },
      {
        id: 'strength_gains',
        title: 'Getting Stronger',
        description: 'Increase weight on a major lift',
        badge: '🏋️',
        category: 'fitness',
        requirement: 'Progressive overload tracked',
        points: 30
      },
      {
        id: 'month_consistent',
        title: 'Monthly Dedication',
        description: 'Complete workouts for 30 consecutive days',
        badge: '🏆',
        category: 'fitness',
        requirement: '30-day workout streak',
        points: 100
      },

      // Academic/Work Achievements
      {
        id: 'first_deep_work',
        title: 'Deep Focus',
        description: 'Complete your first 2.5-hour deep work session',
        badge: '🧠',
        category: 'academic',
        requirement: 'Complete 5 pomodoros in one session',
        points: 20
      },
      {
        id: 'project_milestone',
        title: 'Project Pioneer',
        description: 'Complete a major project milestone',
        badge: '🚀',
        category: 'academic',
        requirement: 'Complete any milestone',
        points: 40
      },
      {
        id: 'exam_ace',
        title: 'Exam Excellence',
        description: 'Achieve high grade in ME course',
        badge: '🎓',
        category: 'academic',
        requirement: 'Grade-based achievement',
        points: 60
      },
      {
        id: 'coding_streak',
        title: 'Code Warrior',
        description: 'Solve DSA problems for 7 consecutive days',
        badge: '👨‍💻',
        category: 'academic',
        requirement: '7-day coding streak',
        points: 35
      },

      // Nutrition Achievements
      {
        id: 'hydration_hero',
        title: 'Hydration Hero',
        description: 'Drink 3L of water for 7 consecutive days',
        badge: '💧',
        category: 'nutrition',
        requirement: 'Meet hydration goal 7 days straight',
        points: 25
      },
      {
        id: 'supplement_streak',
        title: 'Supplement Consistency',
        description: 'Take supplements as scheduled for 30 days',
        badge: '💊',
        category: 'nutrition',
        requirement: 'Complete supplement routine 30 days',
        points: 40
      },
      {
        id: 'meal_timing',
        title: 'Perfect Timing',
        description: 'Follow meal timing for one full week',
        badge: '⏰',
        category: 'nutrition',
        requirement: 'On-time meals for 7 days',
        points: 30
      },

      // Habit & Lifestyle Achievements
      {
        id: 'morning_routine',
        title: 'Morning Champion',
        description: 'Complete morning routine for 14 consecutive days',
        badge: '🌅',
        category: 'lifestyle',
        requirement: '14-day morning routine streak',
        points: 45
      },
      {
        id: 'sleep_schedule',
        title: 'Sleep Optimizer',
        description: 'Maintain consistent sleep schedule for 21 days',
        badge: '😴',
        category: 'lifestyle',
        requirement: 'Sleep 11PM-6AM for 21 days',
        points: 55
      },
      {
        id: 'meditation_master',
        title: 'Mindful Master',
        description: 'Meditate for 30 consecutive days',
        badge: '🧘',
        category: 'lifestyle',
        requirement: 'Daily meditation for 30 days',
        points: 50
      },

      // Progress & Analytics Achievements
      {
        id: 'data_driven',
        title: 'Data Driven',
        description: 'Complete weekly review for 4 consecutive weeks',
        badge: '📊',
        category: 'progress',
        requirement: 'Submit 4 weekly reviews',
        points: 35
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain any habit for 100 days',
        badge: '🔢',
        category: 'progress',
        requirement: '100-day streak on any habit',
        points: 150
      },
      {
        id: 'goal_achiever',
        title: 'Goal Achiever',
        description: 'Complete 5 major milestones',
        badge: '🎯',
        category: 'progress',
        requirement: 'Complete 5 milestones',
        points: 80
      }
    ]

    // Filter achievements based on query parameters
    let filteredAchievements = allAchievements

    if (category) {
      filteredAchievements = filteredAchievements.filter(a => a.category === category)
    }

    // Simulate checking which achievements are unlocked based on user data
    const userStats = await getUserStats(dbUser.id)
    
    const achievementsWithStatus = await Promise.all(
      filteredAchievements.map(async (achievement) => {
        const isUnlocked = await checkAchievementUnlocked(achievement.id, userStats)
        const unlockedAt = isUnlocked ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null
        
        return {
          ...achievement,
          unlocked: isUnlocked,
          unlockedAt,
          progress: getAchievementProgress(achievement.id, userStats)
        }
      })
    )

    // Filter by unlocked status if requested
    if (unlocked !== null) {
      const unlockedFilter = unlocked === 'true'
      filteredAchievements = achievementsWithStatus.filter(a => a.unlocked === unlockedFilter)
    }

    // Paginate results
    const total = filteredAchievements.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedAchievements = achievementsWithStatus.slice(startIndex, endIndex)

    const response = {
      achievements: paginatedAchievements,
      summary: {
        totalAchievements: allAchievements.length,
        unlockedCount: achievementsWithStatus.filter(a => a.unlocked).length,
        totalPoints: achievementsWithStatus.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
        categories: ['fitness', 'academic', 'nutrition', 'lifestyle', 'progress']
      }
    }

    return createPaginatedResponse(paginatedAchievements, { page, limit, total })

  } catch (error) {
    console.error('Get achievements error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// POST /api/achievements - Manually unlock an achievement (for testing)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    const { data: achievementData, error: validationError } = await validateRequestBody(
      request,
      achievementSchema
    )

    if (validationError) {
      return createErrorResponse(validationError, 400)
    }

    // In a real implementation, you'd store achievements in a separate table
    // For now, we'll just return the achievement as unlocked
    const achievement = {
      id: `custom_${Date.now()}`,
      ...achievementData,
      unlocked: true,
      unlockedAt: new Date(),
      progress: 100,
      points: 10
    }

    return createSuccessResponse(achievement, 'Achievement unlocked!', 201)

  } catch (error) {
    console.error('Create achievement error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// Helper functions
async function getUserStats(userId: string) {
  const [
    workoutCount,
    milestoneCount,
    completedMilestones,
    weeklyReviews
  ] = await Promise.all([
    prisma.workoutSession.count({ where: { userId, completed: true } }),
    prisma.milestone.count({ where: { userId } }),
    prisma.milestone.count({ where: { userId, completed: true } }),
    prisma.weeklyReview.count({ where: { userId } })
  ])

  return {
    workoutCount,
    milestoneCount,
    completedMilestones,
    weeklyReviews
  }
}

async function checkAchievementUnlocked(achievementId: string, stats: any): Promise<boolean> {
  // Simple achievement unlock logic based on stats
  switch (achievementId) {
    case 'first_workout':
      return stats.workoutCount >= 1
    case 'week_consistency':
      return stats.workoutCount >= 4
    case 'first_deep_work':
      return stats.workoutCount >= 1 // Simplified
    case 'project_milestone':
      return stats.completedMilestones >= 1
    case 'data_driven':
      return stats.weeklyReviews >= 4
    case 'goal_achiever':
      return stats.completedMilestones >= 5
    default:
      return Math.random() > 0.5 // Random for demo purposes
  }
}

function getAchievementProgress(achievementId: string, stats: any): number {
  // Return progress percentage for achievement
  switch (achievementId) {
    case 'first_workout':
      return Math.min(stats.workoutCount * 100, 100)
    case 'week_consistency':
      return Math.min((stats.workoutCount / 4) * 100, 100)
    case 'project_milestone':
      return Math.min(stats.completedMilestones * 100, 100)
    case 'goal_achiever':
      return Math.min((stats.completedMilestones / 5) * 100, 100)
    default:
      return Math.floor(Math.random() * 100)
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