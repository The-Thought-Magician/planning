# Dashboard API Integration

This document outlines the API integration changes made to the Lock-In Protocol dashboard components.

## Overview

The dashboard components have been updated to replace mock data with real API calls using React Query (TanStack Query) for efficient data fetching, caching, and state management.

## Components Updated

### 1. Daily Progress (`src/components/dashboard/daily-progress.tsx`)

**API Endpoints Used:**
- `/api/metrics` - Fetches today's daily metrics (schedule adherence, deep work, pomodoro count, etc.)
- `/api/analytics/dashboard` - Fetches overall dashboard data including hydration and other metrics

**Features:**
- Real-time progress tracking
- Loading skeletons
- Error handling with retry functionality
- Automatic data refresh every 30 seconds for real-time feel
- Toast notifications for errors

### 2. Schedule Overview (`src/components/dashboard/schedule-overview.tsx`)

**API Endpoints Used:**
- `/api/time-blocks` - Fetches today's time blocks with sorting by start time
- `/api/time-blocks/{id}` - Updates time block completion status

**Features:**
- Real schedule data from database
- Live time block status detection
- One-click completion of time blocks
- Optimistic updates for better UX
- Next task prediction and time calculation
- Loading states and error handling

### 3. Quick Actions (`src/components/dashboard/quick-actions.tsx`)

**API Endpoints Used:**
- `/api/workouts` - Quick workout logging
- `/api/nutrition/meals` - Quick meal logging
- `/api/nutrition/hydration` - Quick hydration logging
- `/api/time-blocks/{id}` - Mark current activity complete

**Features:**
- Real API calls for quick logging actions
- Smart current activity detection
- Upcoming tasks derived from actual time blocks
- Loading states during API calls
- Success/error toast notifications
- Disabled states when no active time block

## Technical Implementation

### React Query Configuration

```typescript
// Query client configuration in src/lib/query-client.tsx
- 1 minute stale time for most queries
- 10 minute garbage collection time
- Automatic retry logic (except for auth errors)
- React Query DevTools integration
```

### Custom Hooks

Created in `src/hooks/api/use-dashboard.ts`:

- `useDashboardData()` - Overall dashboard data (2min stale time)
- `useTodaysMetrics()` - Today's metrics (30s stale time) 
- `useTodaysTimeBlocks()` - Today's schedule (30s stale time)
- `useUpdateTimeBlock()` - Time block mutations
- `useQuickWorkoutLog()` - Quick workout logging
- `useQuickMealLog()` - Quick meal logging
- `useQuickHydrationLog()` - Quick hydration logging

### Error Handling

- **Loading States**: Skeleton components for all loading states
- **Error States**: Dedicated error components with retry options
- **Error Boundaries**: React Error Boundaries wrap each dashboard section
- **Toast Notifications**: User-friendly error and success messages
- **Optimistic Updates**: Immediate UI updates for better perceived performance

### Performance Optimizations

1. **Query Caching**: Intelligent cache invalidation and updates
2. **Stale-while-revalidate**: Show cached data while fetching updates
3. **Optimistic Updates**: Update UI immediately before API confirmation
4. **Background Refetching**: Automatic data refresh without user interaction
5. **Selective Queries**: Only fetch data when components are mounted

## API Response Format

All API endpoints follow the standardized format:

```typescript
{
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

## Loading States

Each component includes:
- **Skeleton Components**: Maintain layout while loading
- **Progressive Loading**: Show partial data as it becomes available
- **Loading Indicators**: Clear feedback during API calls

## Error Recovery

- **Automatic Retry**: Failed requests retry up to 3 times
- **Manual Retry**: Users can manually retry failed requests
- **Graceful Degradation**: Components show available data even if some APIs fail
- **Error Logging**: Errors are logged to console for debugging

## Real-time Features

- **30-second refresh**: Critical data refreshes every 30 seconds
- **Live time detection**: Current time block detection updates automatically
- **Optimistic UI**: Actions feel instant with immediate UI updates
- **Cache synchronization**: Related queries update when mutations succeed

## Usage

The dashboard now provides:

1. **Real Progress Tracking**: Actual completion rates and metrics
2. **Live Schedule Updates**: Current status of time blocks
3. **Functional Quick Actions**: Actions that create real data
4. **Error Resilience**: Graceful handling of API failures
5. **Performance**: Fast loading with smart caching

## Future Enhancements

- WebSocket integration for real-time updates
- Offline support with optimistic mutations
- Advanced caching strategies
- Real-time collaboration features
- Push notifications integration

## Dependencies Added

```json
{
  "@tanstack/react-query": "^5.85.3",
  "@tanstack/react-query-devtools": "^5.85.3"
}
```

## Files Modified

1. `src/app/layout.tsx` - Added QueryProvider
2. `src/lib/query-client.tsx` - Query client configuration
3. `src/hooks/api/use-dashboard.ts` - API hooks
4. `src/components/ui/skeleton.tsx` - Loading states
5. `src/components/error-boundary.tsx` - Error handling
6. `src/app/(app)/dashboard/page.tsx` - Error boundaries
7. `src/components/dashboard/daily-progress.tsx` - API integration
8. `src/components/dashboard/schedule-overview.tsx` - API integration
9. `src/components/dashboard/quick-actions.tsx` - API integration

The dashboard is now fully integrated with the backend API and provides a robust, real-time user experience.