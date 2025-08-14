import { Metadata } from 'next'
import { WorkoutDashboard } from '@/components/workout/workout-dashboard'
import { WorkoutSession } from '@/components/workout/workout-session'
import { HiitTimer } from '@/components/workout/hiit-timer'
import { MobilityChecklist } from '@/components/workout/mobility-checklist'
import { ProgressiveOverload } from '@/components/workout/progressive-overload'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Workout',
  description: 'Track your 4-day workout split, log exercises, and monitor progressive overload.',
}

export default function WorkoutPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Tracker</h1>
        <p className="text-muted-foreground">
          Track your 4-day split: Upper 1, Lower 1, Upper 2, Lower 2
        </p>
      </div>

      {/* Main Workout Interface */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="session">Training</TabsTrigger>
          <TabsTrigger value="hiit">HIIT Timer</TabsTrigger>
          <TabsTrigger value="mobility">Mobility</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <WorkoutDashboard />
        </TabsContent>

        <TabsContent value="session" className="space-y-6">
          <WorkoutSession />
        </TabsContent>

        <TabsContent value="hiit" className="space-y-6">
          <HiitTimer />
        </TabsContent>

        <TabsContent value="mobility" className="space-y-6">
          <MobilityChecklist />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressiveOverload />
        </TabsContent>
      </Tabs>
    </div>
  )
}