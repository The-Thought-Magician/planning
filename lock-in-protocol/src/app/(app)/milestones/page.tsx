import { Metadata } from 'next'
import { GoalTracker } from '@/components/milestones/goal-tracker'
import { HabitStreaks } from '@/components/milestones/habit-streaks'
import { AchievementBadges } from '@/components/milestones/achievement-badges'
import { MilestoneProgress } from '@/components/milestones/milestone-progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Milestones',
  description: 'Track your goals, habits, and achievements across academic, professional, fitness, and personal categories.',
}

export default function MilestonesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Milestones & Goals</h1>
        <p className="text-muted-foreground">
          Track your progress across academic, professional, fitness, and personal goals
        </p>
      </div>

      {/* Main Milestones Interface */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
          <TabsTrigger value="habits">Habit Streaks</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <MilestoneProgress />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalTracker />
        </TabsContent>

        <TabsContent value="habits" className="space-y-6">
          <HabitStreaks />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <AchievementBadges />
        </TabsContent>
      </Tabs>
    </div>
  )
}