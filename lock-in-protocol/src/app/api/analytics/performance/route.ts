import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  methodNotAllowed,
  handleOptions,
  API_ERRORS
} from '@/lib/api-utils'

// GET /api/analytics/performance - Get detailed performance metrics and trends
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

    // Get query parameters
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '30' // days
    const category = url.searchParams.get('category') // fitness, productivity, nutrition, etc.

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get comprehensive performance data
    const [
      dailyMetrics,
      workoutSessions,
      timeBlocks,
      milestones,
      weeklyReviews,
      mealEntries,
      supplementLogs
    ] = await Promise.all([
      prisma.dailyMetric.findMany({
        where: {
          userId: dbUser.id,
          date: { gte: startDate }
        },
        orderBy: { date: 'asc' }
      }),
      prisma.workoutSession.findMany({
        where: {
          userId: dbUser.id,
          date: { gte: startDate }
        },
        include: {
          exercises: true
        },
        orderBy: { date: 'asc' }
      }),
      prisma.timeBlock.findMany({
        where: {
          userId: dbUser.id,
          startTime: { gte: startDate }
        },
        orderBy: { startTime: 'asc' }
      }),
      prisma.milestone.findMany({
        where: {
          userId: dbUser.id,
          updatedAt: { gte: startDate }
        },
        orderBy: { updatedAt: 'asc' }
      }),
      prisma.weeklyReview.findMany({
        where: {
          userId: dbUser.id,
          weekStarting: { gte: startDate }
        },
        orderBy: { weekStarting: 'asc' }
      }),
      prisma.mealEntry.findMany({
        where: {
          userId: dbUser.id,
          date: { gte: startDate }
        }
      }),
      prisma.supplementLog.findMany({
        where: {
          userId: dbUser.id,
          date: { gte: startDate }
        }
      })
    ])

    // Calculate performance metrics based on category or all
    const performanceData = {
      period: {
        days: periodDays,
        startDate,
        endDate: new Date()
      },
      
      // Overall performance trends
      overallTrends: {
        scheduleAdherenceTrend: calculateTrend(dailyMetrics, 'scheduleAdherence'),
        productivityTrend: calculateProductivityTrend(dailyMetrics),
        wellnessTrend: calculateWellnessTrend(dailyMetrics),
        consistencyScore: calculateConsistencyScore(dailyMetrics, workoutSessions)
      },
      
      // Detailed category performance
      categoryPerformance: {
        fitness: calculateFitnessPerformance(workoutSessions, dailyMetrics),
        productivity: calculateProductivityPerformance(dailyMetrics, timeBlocks),
        nutrition: calculateNutritionPerformance(mealEntries, supplementLogs),
        goals: calculateGoalsPerformance(milestones),
        habits: calculateHabitsPerformance(timeBlocks, dailyMetrics)
      },
      
      // Daily performance data for charts
      dailyPerformance: generateDailyPerformanceData(dailyMetrics, workoutSessions, timeBlocks),
      
      // Weekly performance summary
      weeklyPerformance: generateWeeklyPerformance(weeklyReviews, dailyMetrics),
      
      // Performance insights and recommendations
      insights: generatePerformanceInsights(dailyMetrics, workoutSessions, weeklyReviews),
      
      // Comparative analytics
      comparisons: {
        thisWeekVsLast: compareWeeklyPerformance(dailyMetrics),
        thisMonthVsLast: compareMonthlyPerformance(dailyMetrics),
        personalBests: calculatePersonalBests(dailyMetrics, workoutSessions)
      },
      
      // Goal tracking performance
      goalTracking: {
        milestoneProgress: calculateMilestoneProgress(milestones),
        targetAchievement: calculateTargetAchievement(dailyMetrics, workoutSessions),
        streakAnalysis: calculateStreakAnalysis(dailyMetrics, workoutSessions)
      }
    }

    // Filter by category if specified
    if (category) {
      const filteredData = {
        period: performanceData.period,
        categoryPerformance: { [category]: performanceData.categoryPerformance[category as keyof typeof performanceData.categoryPerformance] },
        insights: performanceData.insights.filter(insight => 
          insight.toLowerCase().includes(category.toLowerCase())
        )
      }
      return createSuccessResponse(filteredData, `${category} performance data retrieved successfully`)
    }

    return createSuccessResponse(performanceData, 'Performance metrics retrieved successfully')

  } catch (error) {
    console.error('Get performance analytics error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

// Helper functions for performance calculations
function calculateTrend(data: any[], field: string): { direction: string, percentage: number, data: number[] } {
  if (data.length < 2) return { direction: 'stable', percentage: 0, data: [] }
  
  const values = data.map(item => item[field]).filter(val => val !== null && val !== undefined)
  if (values.length < 2) return { direction: 'stable', percentage: 0, data: values }
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2))
  const secondHalf = values.slice(Math.floor(values.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  const percentage = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0
  const direction = percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable'
  
  return { direction, percentage: Math.abs(percentage), data: values }
}

function calculateProductivityTrend(metrics: any[]) {
  const productivityScores = metrics.map(m => {
    let score = 0
    score += m.scheduleAdherence * 30
    score += Math.min(m.deepWorkHours / 8, 1) * 40
    score += Math.min(m.pomodoroCount / 10, 1) * 20
    score += m.workoutCompleted ? 10 : 0
    return score
  })
  
  return calculateTrend(productivityScores.map((score, index) => ({ productivityScore: score })), 'productivityScore')
}

function calculateWellnessTrend(metrics: any[]) {
  const wellnessScores = metrics.map(m => {
    let score = 0
    let factors = 0
    
    if (m.sleepQuality !== null) {
      score += (m.sleepQuality / 10) * 40
      factors += 40
    }
    if (m.energyLevel !== null) {
      score += (m.energyLevel / 10) * 30
      factors += 30
    }
    if (m.stressLevel !== null) {
      score += ((10 - m.stressLevel) / 10) * 30
      factors += 30
    }
    
    return factors > 0 ? (score / factors) * 100 : 0
  })
  
  return calculateTrend(wellnessScores.map((score, index) => ({ wellnessScore: score })), 'wellnessScore')
}

function calculateConsistencyScore(metrics: any[], workouts: any[]): number {
  const totalDays = metrics.length
  if (totalDays === 0) return 0
  
  let consistentDays = 0
  
  metrics.forEach(metric => {
    const dayWorkouts = workouts.filter(w => 
      new Date(w.date).toDateString() === new Date(metric.date).toDateString()
    )
    
    // Day is consistent if schedule adherence > 70% and has some productivity
    if (metric.scheduleAdherence > 0.7 && (metric.pomodoroCount > 0 || dayWorkouts.length > 0)) {
      consistentDays++
    }
  })
  
  return (consistentDays / totalDays) * 100
}

function calculateFitnessPerformance(workouts: any[], metrics: any[]) {
  const completedWorkouts = workouts.filter(w => w.completed)
  const workoutDays = new Set(workouts.map(w => new Date(w.date).toDateString())).size
  
  return {
    totalWorkouts: workouts.length,
    completedWorkouts: completedWorkouts.length,
    completionRate: workouts.length > 0 ? (completedWorkouts.length / workouts.length) * 100 : 0,
    averageExercisesPerWorkout: workouts.length > 0 
      ? workouts.reduce((sum, w) => sum + w.exercises.length, 0) / workouts.length 
      : 0,
    workoutFrequency: workoutDays,
    workoutTypes: getWorkoutTypeDistribution(workouts),
    progressiveDays: metrics.filter(m => m.workoutCompleted).length
  }
}

function calculateProductivityPerformance(metrics: any[], timeBlocks: any[]) {
  const totalPomodoros = metrics.reduce((sum, m) => sum + m.pomodoroCount, 0)
  const totalDeepWork = metrics.reduce((sum, m) => sum + m.deepWorkHours, 0)
  const completedBlocks = timeBlocks.filter(tb => tb.completed).length
  
  return {
    totalPomodoroSessions: totalPomodoros,
    totalDeepWorkHours: totalDeepWork,
    averagePomodorosPerDay: metrics.length > 0 ? totalPomodoros / metrics.length : 0,
    averageDeepWorkPerDay: metrics.length > 0 ? totalDeepWork / metrics.length : 0,
    timeBlockCompletionRate: timeBlocks.length > 0 ? (completedBlocks / timeBlocks.length) * 100 : 0,
    averageScheduleAdherence: metrics.length > 0 
      ? (metrics.reduce((sum, m) => sum + m.scheduleAdherence, 0) / metrics.length) * 100 
      : 0,
    productivityCategories: getTimeBlockCategoryDistribution(timeBlocks)
  }
}

function calculateNutritionPerformance(meals: any[], supplements: any[]) {
  return {
    mealsLogged: meals.length,
    mealsCompleted: meals.filter(m => m.completed).length,
    mealCompletionRate: meals.length > 0 ? (meals.filter(m => m.completed).length / meals.length) * 100 : 0,
    supplementsLogged: supplements.length,
    supplementsCompleted: supplements.filter(s => s.completed).length,
    supplementCompletionRate: supplements.length > 0 ? (supplements.filter(s => s.completed).length / supplements.length) * 100 : 0,
    mealTypes: getMealTypeDistribution(meals),
    supplementTypes: getSupplementTypeDistribution(supplements)
  }
}

function calculateGoalsPerformance(milestones: any[]) {
  return {
    totalMilestones: milestones.length,
    completedMilestones: milestones.filter(m => m.completed).length,
    completionRate: milestones.length > 0 ? (milestones.filter(m => m.completed).length / milestones.length) * 100 : 0,
    averageProgress: milestones.length > 0 
      ? milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length 
      : 0,
    categoryDistribution: getMilestoneCategoryDistribution(milestones),
    overdueCount: milestones.filter(m => 
      m.targetDate && new Date(m.targetDate) < new Date() && !m.completed
    ).length
  }
}

function calculateHabitsPerformance(timeBlocks: any[], metrics: any[]) {
  // Simplified habit tracking based on consistent activities
  const morningBlocks = timeBlocks.filter(tb => 
    tb.category.includes('MORNING') || 
    new Date(tb.startTime).getHours() < 9
  )
  const eveningBlocks = timeBlocks.filter(tb => 
    tb.category.includes('EVENING') || 
    new Date(tb.startTime).getHours() > 20
  )
  
  return {
    morningRoutineConsistency: morningBlocks.length > 0 
      ? (morningBlocks.filter(mb => mb.completed).length / morningBlocks.length) * 100 
      : 0,
    eveningRoutineConsistency: eveningBlocks.length > 0 
      ? (eveningBlocks.filter(eb => eb.completed).length / eveningBlocks.length) * 100 
      : 0,
    meditationStreak: calculateActivityStreak(timeBlocks, 'MEDITATION'),
    mobilityStreak: calculateActivityStreak(timeBlocks, 'MOBILITY'),
    deepWorkStreak: metrics.filter(m => m.deepWorkHours >= 3).length
  }
}

function generateDailyPerformanceData(metrics: any[], workouts: any[], timeBlocks: any[]) {
  return metrics.map(metric => {
    const dayWorkouts = workouts.filter(w => 
      new Date(w.date).toDateString() === new Date(metric.date).toDateString()
    )
    const dayBlocks = timeBlocks.filter(tb => 
      new Date(tb.startTime).toDateString() === new Date(metric.date).toDateString()
    )
    
    return {
      date: metric.date,
      scheduleAdherence: metric.scheduleAdherence * 100,
      pomodoroCount: metric.pomodoroCount,
      deepWorkHours: metric.deepWorkHours,
      workoutCompleted: dayWorkouts.some(w => w.completed),
      timeBlocksCompleted: dayBlocks.filter(tb => tb.completed).length,
      sleepQuality: metric.sleepQuality,
      energyLevel: metric.energyLevel,
      stressLevel: metric.stressLevel
    }
  })
}

function generateWeeklyPerformance(weeklyReviews: any[], metrics: any[]) {
  return weeklyReviews.map(review => ({
    weekStarting: review.weekStarting,
    overallRating: review.overallRating,
    workedWell: Array.isArray(review.workedWell) ? review.workedWell.length : 0,
    challenges: Array.isArray(review.challenges) ? review.challenges.length : 0,
    improvements: Array.isArray(review.improvements) ? review.improvements.length : 0
  }))
}

function generatePerformanceInsights(metrics: any[], workouts: any[], reviews: any[]): string[] {
  const insights: string[] = []
  
  // Productivity insights
  const avgPomodoroCount = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.pomodoroCount, 0) / metrics.length 
    : 0
    
  if (avgPomodoroCount > 8) {
    insights.push("🍅 Excellent focus! You're consistently hitting high pomodoro counts.")
  } else if (avgPomodoroCount < 4) {
    insights.push("⚠️ Consider increasing focus sessions. Aim for 6+ pomodoros daily.")
  }
  
  // Workout insights
  const workoutConsistency = workouts.filter(w => w.completed).length / Math.max(workouts.length, 1)
  if (workoutConsistency > 0.8) {
    insights.push("💪 Outstanding workout consistency! Your discipline is exceptional.")
  } else if (workoutConsistency < 0.5) {
    insights.push("🎯 Focus on workout consistency. Schedule them at fixed times.")
  }
  
  // Weekly review insights
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
    if (avgRating > 7) {
      insights.push("📈 Your weekly ratings show strong satisfaction with progress.")
    } else if (avgRating < 5) {
      insights.push("🔄 Weekly ratings suggest need for strategy adjustments.")
    }
  }
  
  return insights
}

function compareWeeklyPerformance(metrics: any[]) {
  if (metrics.length < 14) return null
  
  const thisWeek = metrics.slice(-7)
  const lastWeek = metrics.slice(-14, -7)
  
  const thisWeekAvg = thisWeek.reduce((sum, m) => sum + m.scheduleAdherence, 0) / thisWeek.length
  const lastWeekAvg = lastWeek.reduce((sum, m) => sum + m.scheduleAdherence, 0) / lastWeek.length
  
  return {
    thisWeekPerformance: thisWeekAvg * 100,
    lastWeekPerformance: lastWeekAvg * 100,
    improvement: ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100
  }
}

function compareMonthlyPerformance(metrics: any[]) {
  if (metrics.length < 60) return null
  
  const thisMonth = metrics.slice(-30)
  const lastMonth = metrics.slice(-60, -30)
  
  const thisMonthAvg = thisMonth.reduce((sum, m) => sum + m.scheduleAdherence, 0) / thisMonth.length
  const lastMonthAvg = lastMonth.reduce((sum, m) => sum + m.scheduleAdherence, 0) / lastMonth.length
  
  return {
    thisMonthPerformance: thisMonthAvg * 100,
    lastMonthPerformance: lastMonthAvg * 100,
    improvement: ((thisMonthAvg - lastMonthAvg) / lastMonthAvg) * 100
  }
}

function calculatePersonalBests(metrics: any[], workouts: any[]) {
  return {
    bestPomodoroDay: Math.max(...metrics.map(m => m.pomodoroCount), 0),
    bestDeepWorkDay: Math.max(...metrics.map(m => m.deepWorkHours), 0),
    bestScheduleAdherence: Math.max(...metrics.map(m => m.scheduleAdherence), 0) * 100,
    longestWorkoutStreak: calculateWorkoutStreak(workouts),
    highestWeeklyPomodoros: calculateHighestWeeklyPomodoros(metrics)
  }
}

function calculateMilestoneProgress(milestones: any[]) {
  if (milestones.length === 0) return { overall: 0, byCategory: {} }
  
  const overall = milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length
  const byCategory: Record<string, number> = {}
  
  const categories = [...new Set(milestones.map(m => m.category))]
  categories.forEach(category => {
    const categoryMilestones = milestones.filter(m => m.category === category)
    byCategory[category] = categoryMilestones.reduce((sum, m) => sum + m.progress, 0) / categoryMilestones.length
  })
  
  return { overall, byCategory }
}

function calculateTargetAchievement(metrics: any[], workouts: any[]) {
  const pomodoroTarget = 6 // daily target
  const deepWorkTarget = 4 // hours daily target
  const workoutTarget = 4 // weekly target
  
  const pomodoroAchievement = metrics.filter(m => m.pomodoroCount >= pomodoroTarget).length
  const deepWorkAchievement = metrics.filter(m => m.deepWorkHours >= deepWorkTarget).length
  const weeksWithWorkoutTarget = Math.floor(workouts.filter(w => w.completed).length / workoutTarget)
  
  return {
    pomodoroTargetDays: pomodoroAchievement,
    deepWorkTargetDays: deepWorkAchievement,
    workoutTargetWeeks: weeksWithWorkoutTarget,
    overallTargetRate: metrics.length > 0 
      ? ((pomodoroAchievement + deepWorkAchievement) / (metrics.length * 2)) * 100 
      : 0
  }
}

function calculateStreakAnalysis(metrics: any[], workouts: any[]) {
  return {
    currentPomodoroStreak: calculateCurrentStreak(metrics.map(m => m.pomodoroCount > 0)),
    currentWorkoutStreak: calculateCurrentStreak(workouts.map(w => w.completed)),
    currentScheduleStreak: calculateCurrentStreak(metrics.map(m => m.scheduleAdherence > 0.7)),
    longestPomodoroStreak: calculateLongestStreak(metrics.map(m => m.pomodoroCount > 0)),
    longestWorkoutStreak: calculateLongestStreak(workouts.map(w => w.completed))
  }
}

// Additional helper functions
function getWorkoutTypeDistribution(workouts: any[]) {
  const distribution: Record<string, number> = {}
  workouts.forEach(w => {
    distribution[w.type] = (distribution[w.type] || 0) + 1
  })
  return distribution
}

function getTimeBlockCategoryDistribution(timeBlocks: any[]) {
  const distribution: Record<string, number> = {}
  timeBlocks.forEach(tb => {
    distribution[tb.category] = (distribution[tb.category] || 0) + 1
  })
  return distribution
}

function getMealTypeDistribution(meals: any[]) {
  const distribution: Record<string, number> = {}
  meals.forEach(m => {
    distribution[m.mealType] = (distribution[m.mealType] || 0) + 1
  })
  return distribution
}

function getSupplementTypeDistribution(supplements: any[]) {
  const distribution: Record<string, number> = {}
  supplements.forEach(s => {
    distribution[s.supplementType] = (distribution[s.supplementType] || 0) + 1
  })
  return distribution
}

function getMilestoneCategoryDistribution(milestones: any[]) {
  const distribution: Record<string, number> = {}
  milestones.forEach(m => {
    distribution[m.category] = (distribution[m.category] || 0) + 1
  })
  return distribution
}

function calculateActivityStreak(timeBlocks: any[], category: string) {
  const relevantBlocks = timeBlocks
    .filter(tb => tb.category.includes(category))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  
  return calculateCurrentStreak(relevantBlocks.map(tb => tb.completed))
}

function calculateWorkoutStreak(workouts: any[]): number {
  const sortedWorkouts = workouts
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(w => w.completed)
  
  return calculateLongestStreak(sortedWorkouts)
}

function calculateHighestWeeklyPomodoros(metrics: any[]): number {
  if (metrics.length < 7) return 0
  
  let maxWeekly = 0
  for (let i = 0; i <= metrics.length - 7; i++) {
    const weekSum = metrics.slice(i, i + 7).reduce((sum, m) => sum + m.pomodoroCount, 0)
    maxWeekly = Math.max(maxWeekly, weekSum)
  }
  
  return maxWeekly
}

function calculateCurrentStreak(booleanArray: boolean[]): number {
  let streak = 0
  for (let i = booleanArray.length - 1; i >= 0; i--) {
    if (booleanArray[i]) {
      streak++
    } else {
      break
    }
  }
  return streak
}

function calculateLongestStreak(booleanArray: boolean[]): number {
  let maxStreak = 0
  let currentStreak = 0
  
  booleanArray.forEach(value => {
    if (value) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  
  return maxStreak
}

export async function OPTIONS() {
  return handleOptions()
}

export async function POST() {
  return methodNotAllowed(['GET'])
}

export async function PUT() {
  return methodNotAllowed(['GET'])
}

export async function PATCH() {
  return methodNotAllowed(['GET'])
}

export async function DELETE() {
  return methodNotAllowed(['GET'])
}