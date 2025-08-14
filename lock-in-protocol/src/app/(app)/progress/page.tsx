import { Metadata } from 'next'
import { AnalyticsDashboard } from '@/components/progress/analytics-dashboard'
import { WeeklyReview } from '@/components/progress/weekly-review'
import { PerformanceMetrics } from '@/components/progress/performance-metrics'
import { GoalComparison } from '@/components/progress/goal-comparison'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Progress',
  description: 'Analyze your progress with detailed analytics, weekly reviews, and performance tracking.',
}

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="text-muted-foreground">
          Track your performance, analyze trends, and make data-driven improvements
        </p>
      </div>

      {/* Main Progress Interface */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="metrics">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Goal vs Actual</TabsTrigger>
          <TabsTrigger value="review">Weekly Review</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <PerformanceMetrics />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <GoalComparison />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <WeeklyReview />
        </TabsContent>
      </Tabs>
    </div>
  )
}