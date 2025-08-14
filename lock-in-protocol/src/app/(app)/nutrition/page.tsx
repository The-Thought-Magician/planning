import { Metadata } from 'next'
import { MealTracker } from '@/components/nutrition/meal-tracker'
import { SupplementLogger } from '@/components/nutrition/supplement-logger'
import { HydrationTracker } from '@/components/nutrition/hydration-tracker'
import { NutritionAnalytics } from '@/components/nutrition/nutrition-analytics'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Nutrition',
  description: 'Track your meals, supplements, hydration, and nutrition analytics.',
}

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nutrition Tracker</h1>
        <p className="text-muted-foreground">
          Monitor your meal timing, supplements, hydration, and nutrition patterns
        </p>
      </div>

      {/* Main Nutrition Interface */}
      <Tabs defaultValue="meals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meals">Meal Tracking</TabsTrigger>
          <TabsTrigger value="supplements">Supplements</TabsTrigger>
          <TabsTrigger value="hydration">Hydration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-6">
          <MealTracker />
        </TabsContent>

        <TabsContent value="supplements" className="space-y-6">
          <SupplementLogger />
        </TabsContent>

        <TabsContent value="hydration" className="space-y-6">
          <HydrationTracker />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <NutritionAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}