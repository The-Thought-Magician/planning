import { Metadata } from 'next'
import { TimeBlockCalendar } from '@/components/calendar/time-block-calendar'
import { PomodoroTimer } from '@/components/calendar/pomodoro-timer'
import { ScheduleEditor } from '@/components/calendar/schedule-editor'

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Manage your time blocks and schedule with integrated pomodoro timer.',
}

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          Plan your Lock-In Protocol with time blocking and focus sessions.
        </p>
      </div>

      {/* Calendar Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Calendar - takes up 3 columns */}
        <div className="lg:col-span-3">
          <TimeBlockCalendar />
        </div>
        
        {/* Side Panel - takes up 1 column */}
        <div className="space-y-6">
          <PomodoroTimer />
          <ScheduleEditor />
        </div>
      </div>
    </div>
  )
}