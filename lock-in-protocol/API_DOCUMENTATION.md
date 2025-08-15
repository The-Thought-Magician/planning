# Lock-In Protocol API Documentation

## Overview
This is a comprehensive API infrastructure for the Lock-In Protocol webapp, built with Next.js 14+ App Router, TypeScript, Prisma, and Supabase authentication.

## Architecture
- **Framework**: Next.js 14+ App Router
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: Supabase Auth
- **Validation**: Zod schemas
- **Error Handling**: Standardized error responses
- **TypeScript**: Full type safety with comprehensive type definitions

## API Structure

### Authentication
- `GET /api/auth/user` - Get current user profile
- `PATCH /api/auth/user` - Update user profile

### Time Blocks & Calendar
- `GET /api/time-blocks` - List time blocks with filtering/pagination
- `POST /api/time-blocks` - Create new time block
- `GET /api/time-blocks/[id]` - Get specific time block
- `PATCH /api/time-blocks/[id]` - Update time block
- `DELETE /api/time-blocks/[id]` - Delete time block
- `GET /api/schedule/template` - Get default Lock-In Protocol schedule template

### Workout Management
- `GET /api/workouts` - List workout sessions with filtering
- `POST /api/workouts` - Create new workout session
- `GET /api/workouts/[id]` - Get specific workout session
- `PATCH /api/workouts/[id]` - Update workout session
- `DELETE /api/workouts/[id]` - Delete workout session
- `GET /api/workouts/templates` - Get workout templates by type

### Exercise Management
- `GET /api/exercises` - List exercises within workout sessions
- `POST /api/exercises` - Add exercise to existing workout session
- `PATCH /api/exercises/[id]` - Update specific exercise
- `DELETE /api/exercises/[id]` - Delete exercise

### Nutrition Tracking
- `GET /api/nutrition/meals` - List meal entries
- `POST /api/nutrition/meals` - Create meal entry
- `GET /api/nutrition/meals/[id]` - Get specific meal entry
- `PATCH /api/nutrition/meals/[id]` - Update meal entry
- `DELETE /api/nutrition/meals/[id]` - Delete meal entry
- `GET /api/nutrition/hydration` - Get hydration data
- `POST /api/nutrition/hydration` - Create/update hydration entry
- `PATCH /api/nutrition/hydration` - Update hydration (add water intake)
- `GET /api/nutrition/supplements` - List supplement logs
- `POST /api/nutrition/supplements` - Create supplement log
- `PATCH /api/nutrition/supplements/[id]` - Update supplement log
- `DELETE /api/nutrition/supplements/[id]` - Delete supplement log

### Milestones & Goals
- `GET /api/milestones` - List milestones with filtering
- `POST /api/milestones` - Create new milestone
- `GET /api/milestones/[id]` - Get specific milestone
- `PATCH /api/milestones/[id]` - Update milestone
- `DELETE /api/milestones/[id]` - Delete milestone

### Habits & Achievements
- `GET /api/habits` - List habits with streak tracking
- `POST /api/habits` - Create new habit
- `GET /api/habits/[id]` - Get specific habit
- `PATCH /api/habits/[id]` - Update habit or log completion
- `DELETE /api/habits/[id]` - Delete habit
- `GET /api/achievements` - Get achievements and badges
- `POST /api/achievements` - Manually unlock achievement

### Progress & Analytics
- `GET /api/metrics` - Get daily metrics with filtering
- `POST /api/metrics` - Create or update daily metric
- `GET /api/analytics/dashboard` - Get comprehensive dashboard data
- `GET /api/analytics/weekly` - Get weekly review data and analytics
- `POST /api/analytics/weekly` - Create or update weekly review
- `GET /api/analytics/performance` - Get detailed performance metrics and trends

## Key Features

### Authentication & Security
- Supabase Auth integration with JWT tokens
- User-scoped data access (all data belongs to authenticated user)
- Rate limiting protection
- CORS support
- Proper HTTP status codes and error handling

### Data Validation
- Zod schema validation for all request bodies
- Type-safe request/response handling
- Comprehensive input sanitization

### Advanced Querying
- Pagination support on list endpoints
- Filtering by date ranges, categories, completion status
- Sorting capabilities
- Search functionality where applicable

### Lock-In Protocol Specific Features
- **4-Day Workout Split**: Upper 1 Push, Lower 1 Quad, Upper 2 Pull, Lower 2 Hamstring/Glute
- **Schedule Templates**: Pre-configured daily schedules optimized for productivity
- **Pomodoro Integration**: Time blocking with pomodoro count tracking
- **Nutrition Tracking**: Meals, hydration, and supplement logging
- **Achievement System**: Comprehensive badge system with 15+ achievements
- **Analytics**: Deep performance insights and trend analysis
- **Weekly Reviews**: Structured reflection and planning

### Workout Templates
The API includes detailed workout templates for each type:
- **Upper 1 Push**: Chest, Shoulders, Triceps (Bench Press, OHP, Incline DB Press, etc.)
- **Lower 1 Quad**: Quads, Glutes, Calves (Squats, Bulgarian Split Squats, Leg Press, etc.)
- **Upper 2 Pull**: Back, Rear Delts, Biceps (Deadlifts, Pull-ups, Barbell Rows, etc.)
- **Lower 2 Hamstring/Glute**: Posterior Chain (RDLs, Hip Thrusts, Good Mornings, etc.)
- **HIIT Cardio**: High-intensity interval training routines
- **Mobility/Recovery**: Comprehensive flexibility and recovery protocols

### Nutrition Guidelines
- **Supplement Schedule**: Creatine, Whey Protein timing
- **Meal Timing**: Optimized meal windows (7:30 AM breakfast, 1:00 PM lunch, etc.)
- **Hydration Tracking**: 3-4L daily water intake targets

### Analytics & Insights
- **Productivity Scoring**: Based on schedule adherence, deep work, and pomodoro counts
- **Wellness Scoring**: Sleep quality, energy levels, stress management
- **Streak Tracking**: Workout consistency, habit maintenance, goal achievement
- **Performance Trends**: Weekly and monthly trend analysis
- **Personal Bests**: Track improvements across all metrics

## Error Handling
- Standardized error response format
- Proper HTTP status codes (400, 401, 403, 404, 409, 500)
- Detailed error messages for validation failures
- Rate limiting with appropriate responses

## Response Format
All API responses follow a consistent format:
```typescript
{
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## Query Parameters
Common query parameters across endpoints:
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - Sort direction 'asc' or 'desc' (default: 'desc')
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `search` - Text search in relevant fields
- `category` - Filter by category/type
- `completed` - Filter by completion status

## File Structure
```
src/
├── app/api/
│   ├── auth/user/route.ts
│   ├── time-blocks/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── schedule/template/route.ts
│   ├── workouts/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── templates/route.ts
│   ├── exercises/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── nutrition/
│   │   ├── meals/
│   │   ├── hydration/
│   │   └── supplements/
│   ├── milestones/
│   ├── habits/
│   ├── achievements/
│   └── analytics/
│       ├── dashboard/
│       ├── weekly/
│       └── performance/
├── lib/
│   ├── api-utils.ts          # Utility functions
│   ├── db.ts                 # Prisma client
│   ├── validations.ts        # Zod schemas
│   └── auth/supabase.ts      # Auth configuration
└── types/
    └── api.ts                # TypeScript type definitions
```

## Getting Started
1. Ensure Prisma is set up with the database
2. Configure Supabase environment variables
3. All routes are protected with authentication
4. Use the provided TypeScript types for type-safe API consumption

This API provides a complete backend for the Lock-In Protocol productivity and fitness tracking system, supporting all aspects of the optimized daily routine including deep work sessions, 4-day workout split, nutrition tracking, and comprehensive analytics.