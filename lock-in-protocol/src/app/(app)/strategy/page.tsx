import { Metadata } from 'next'
import { WeeklyPlanner } from '@/components/strategy/weekly-planner'
import { ScheduleOptimizer } from '@/components/strategy/schedule-optimizer'
import { GoalWizard } from '@/components/strategy/goal-wizard'
import { StrategicReview } from '@/components/strategy/strategic-review'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Strategy',
  description: 'Plan your weeks, optimize your schedule, set strategic goals, and conduct strategic reviews.',
}

export default function StrategyPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Strategic Planning</h1>
        <p className="text-muted-foreground">
          Plan your weeks, optimize your schedule, and set strategic goals for maximum effectiveness
        </p>
      </div>

      {/* Main Strategy Interface */}
      <Tabs defaultValue="planner" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="planner">Weekly Planner</TabsTrigger>
          <TabsTrigger value="optimizer">Schedule Optimizer</TabsTrigger>
          <TabsTrigger value="goals">Goal Wizard</TabsTrigger>
          <TabsTrigger value="review">Strategic Review</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-6">
          <WeeklyPlanner />
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-6">
          <ScheduleOptimizer />
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <GoalWizard />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <StrategicReview />
        </TabsContent>
      </Tabs>
    </div>
  )
}