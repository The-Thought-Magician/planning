import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  authenticateUser,
  createErrorResponse,
  createSuccessResponse,
  methodNotAllowed,
  handleOptions,
  API_ERRORS,
} from '@/lib/api-utils'

// GET /api/progress - Summarized progress snapshot and optional CSV export of daily metrics
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    if (error || !user) {return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)}

    const dbUser = await prisma.user.findUnique({ where: { email: user.email! } })
    if (!dbUser) {return createErrorResponse(API_ERRORS.NOT_FOUND, 404)}

    const url = new URL(request.url)
    const range = url.searchParams.get('range') || '30d' // 7d|30d|90d|custom
    const exportFormat = url.searchParams.get('export') // csv|json
    const start = url.searchParams.get('start')
    const end = url.searchParams.get('end')

    // Resolve date window
    let startDate: Date
    let endDate: Date
    if (range === 'custom' && start && end) {
      startDate = new Date(start)
      endDate = new Date(end)
    } else {
      endDate = new Date()
      startDate = new Date()
      const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
      startDate.setDate(endDate.getDate() - days)
    }

    const [metrics, workouts, timeBlocks, meals, supplements, milestones] = await Promise.all([
      prisma.dailyMetric.findMany({
        where: { userId: dbUser.id, date: { gte: startDate, lte: endDate } },
        orderBy: { date: 'asc' },
      }),
      prisma.workoutSession.findMany({
        where: { userId: dbUser.id, date: { gte: startDate, lte: endDate } },
        include: { exercises: true },
        orderBy: { date: 'asc' },
      }),
      prisma.timeBlock.findMany({
        where: { userId: dbUser.id, startTime: { gte: startDate, lte: endDate } },
        orderBy: { startTime: 'asc' },
      }),
      prisma.mealEntry.findMany({ where: { userId: dbUser.id, date: { gte: startDate, lte: endDate } } }),
      prisma.supplementLog.findMany({ where: { userId: dbUser.id, date: { gte: startDate, lte: endDate } } }),
      prisma.milestone.findMany({ where: { userId: dbUser.id } }),
    ])

    const summary = {
      period: { startDate, endDate },
      counts: {
        days: metrics.length,
        workouts: workouts.length,
        timeBlocks: timeBlocks.length,
        meals: meals.length,
        supplements: supplements.length,
      },
      averages: {
        adherence: metrics.length ? metrics.reduce((s, m) => s + m.scheduleAdherence, 0) / metrics.length : 0,
        deepWork: metrics.length ? metrics.reduce((s, m) => s + m.deepWorkHours, 0) / metrics.length : 0,
        pomodoros: metrics.length ? metrics.reduce((s, m) => s + m.pomodoroCount, 0) / metrics.length : 0,
      },
      completion: {
        workouts: workouts.length ? (workouts.filter(w => w.completed).length / workouts.length) * 100 : 0,
        timeBlocks: timeBlocks.length ? (timeBlocks.filter(tb => tb.completed).length / timeBlocks.length) * 100 : 0,
        meals: meals.length ? (meals.filter(m => m.completed).length / meals.length) * 100 : 0,
        supplements: supplements.length ? (supplements.filter(s => s.completed).length / supplements.length) * 100 : 0,
      },
      goals: {
        total: milestones.length,
        completed: milestones.filter(m => m.completed).length,
        avgProgress: milestones.length ? milestones.reduce((s, m) => s + m.progress, 0) / milestones.length : 0,
      },
    }

    if (exportFormat === 'csv') {
      // Minimal CSV export for metrics
      const header = 'date,scheduleAdherence,deepWorkHours,pomodoroCount,workoutCompleted,sleepQuality,energyLevel,stressLevel\n'
      const rows = metrics
        .map(
          m =>
            `${m.date.toISOString()},${m.scheduleAdherence},${m.deepWorkHours},${m.pomodoroCount},${m.workoutCompleted},${m.sleepQuality ?? ''},${m.energyLevel ?? ''},${m.stressLevel ?? ''}`
        )
        .join('\n')
      const csv = header + rows
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="progress_${startDate.toISOString().slice(0, 10)}_${endDate
            .toISOString()
            .slice(0, 10)}.csv"`,
        },
      })
    }

    return createSuccessResponse({ summary, metrics, workouts, timeBlocks })
  } catch (error) {
    console.error('Get progress error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
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
