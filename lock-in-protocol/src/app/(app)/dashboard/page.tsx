import { Metadata } from 'next'
import { ScheduleOverview } from '@/components/dashboard/schedule-overview'
import { CurrentActivity } from '@/components/dashboard/current-activity'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { MotivationMetrics } from '@/components/dashboard/motivation-metrics'
import { ErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your Lock-In Protocol dashboard - track today\'s progress and stay on schedule.',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Lock-In Protocol. Stay focused, stay consistent.
        </p>
      </div>

      {/* Current Activity Section */}
      <CurrentActivity />

      {/* Main Dashboard Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Daily Progress - Full width on mobile, 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ErrorBoundary>
            <DailyProgress />
          </ErrorBoundary>
        </div>
        
        {/* Quick Actions */}
        <div className="space-y-4 sm:space-y-6">
          <ErrorBoundary>
            <QuickActions />
          </ErrorBoundary>
          <ErrorBoundary>
            <MotivationMetrics />
          </ErrorBoundary>
        </div>
      </div>

      {/* Schedule Overview */}
      <ErrorBoundary>
        <ScheduleOverview />
      </ErrorBoundary>
    </div>
  )
}