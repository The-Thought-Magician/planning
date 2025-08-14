# Lock-In Protocol Webapp - Complete Development Guide

## Project Overview
A comprehensive Next.js webapp for personal productivity tracking based on the Lock-In Protocol. This app helps track schedule adherence, workouts, nutrition, milestones, and provides analytics for continuous improvement.

## Technology Stack

### Frontend & Framework
- **Next.js 14+ with App Router** - Server-side rendering, static optimization, Vercel integration
- **TypeScript** - Type safety for complex data management
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Smooth animations and transitions

### Component Library & UI
- **shadcn/ui** - Beautiful, customizable components built on Radix UI
- **Lucide React** - Consistent icon system
- **Recharts** - Data visualization for progress reports and analytics
- **React Hook Form + Zod** - Form handling with robust validation

### Database & Backend
- **Supabase** - PostgreSQL database with real-time features
- **Prisma** - Type-safe database client with excellent TypeScript integration
- **Supabase Auth** - Authentication system (single-user focused)

### Utilities & Tools
- **date-fns** - Date manipulation for scheduling features
- **class-variance-authority (cva)** - Utility for component variants
- **clsx** - Conditional class names

### Deployment
- **Vercel** - Seamless Next.js deployment with database integration
- **PWA capabilities** - Mobile app-like experience

## Project Structure

```
lock-in-protocol/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Authentication routes
│   │   │   └── login/
│   │   │       ├── page.tsx
│   │   │       └── loading.tsx
│   │   ├── dashboard/                # Dashboard page
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── calendar/                 # Calendar & scheduling
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── workout/                  # Workout tracking
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── nutrition/                # Nutrition tracking
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── milestones/               # Goal tracking
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── progress/                 # Analytics & reports
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── strategy/                 # Planning & reviews
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── components/
│   │   ├── api/                      # API routes
│   │   │   ├── schedule/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── workouts/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── nutrition/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── milestones/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   └── progress/
│   │   │       └── route.ts
│   │   ├── globals.css
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   ├── loading.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── toast.tsx
│   │   │   └── chart.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── navigation.tsx
│   │   │   └── mobile-nav.tsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── schedule-overview.tsx
│   │   │   ├── current-activity.tsx
│   │   │   ├── daily-progress.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   └── motivation-metrics.tsx
│   │   ├── calendar/                 # Calendar components
│   │   │   ├── time-block-calendar.tsx
│   │   │   ├── pomodoro-timer.tsx
│   │   │   ├── schedule-editor.tsx
│   │   │   └── task-notes.tsx
│   │   ├── workout/                  # Workout components
│   │   │   ├── workout-logger.tsx
│   │   │   ├── exercise-tracker.tsx
│   │   │   ├── progressive-overload.tsx
│   │   │   ├── hiit-timer.tsx
│   │   │   └── mobility-checklist.tsx
│   │   ├── nutrition/                # Nutrition components
│   │   │   ├── meal-tracker.tsx
│   │   │   ├── supplement-logger.tsx
│   │   │   ├── hydration-tracker.tsx
│   │   │   └── nutrition-analytics.tsx
│   │   ├── milestones/               # Milestone components
│   │   │   ├── goal-tracker.tsx
│   │   │   ├── milestone-card.tsx
│   │   │   ├── habit-streaks.tsx
│   │   │   └── achievement-badges.tsx
│   │   ├── progress/                 # Progress components
│   │   │   ├── analytics-dashboard.tsx
│   │   │   ├── trend-charts.tsx
│   │   │   ├── performance-metrics.tsx
│   │   │   └── reflection-journal.tsx
│   │   └── strategy/                 # Strategy components
│   │       ├── weekly-planner.tsx
│   │       ├── review-interface.tsx
│   │       ├── goal-setter.tsx
│   │       └── optimization-tools.tsx
│   ├── lib/
│   │   ├── db/                       # Database utilities
│   │   │   ├── client.ts             # Prisma client
│   │   │   ├── queries.ts            # Database queries
│   │   │   └── mutations.ts          # Database mutations
│   │   ├── auth/                     # Authentication utilities
│   │   │   ├── config.ts
│   │   │   └── middleware.ts
│   │   ├── utils.ts                  # General utilities
│   │   ├── validations.ts            # Zod schemas
│   │   ├── constants.ts              # App constants
│   │   ├── notifications.ts          # Notification system
│   │   └── analytics.ts              # Analytics utilities
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-schedule.ts
│   │   ├── use-workouts.ts
│   │   ├── use-nutrition.ts
│   │   ├── use-progress.ts
│   │   └── use-notifications.ts
│   ├── types/                        # TypeScript definitions
│   │   ├── schedule.ts
│   │   ├── workout.ts
│   │   ├── nutrition.ts
│   │   ├── milestones.ts
│   │   └── analytics.ts
│   └── data/                        # Static data
│       ├── workout-plans.ts          # Predefined workout routines
│       ├── exercise-database.ts      # Exercise definitions
│       ├── nutrition-templates.ts    # Meal templates
│       └── schedule-templates.ts     # Schedule templates
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Database migrations
│   └── seed.ts                       # Database seeding
├── public/
│   ├── icons/                        # App icons
│   ├── images/                       # Static images
│   └── manifest.json                 # PWA manifest
├── package.json
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── .env.local                        # Environment variables
└── README.md
```

## Database Schema Design

### Core Tables

```prisma
// User Management (Single user setup)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  timeBlocks      TimeBlock[]
  workoutSessions WorkoutSession[]
  mealEntries     MealEntry[]
  supplementLogs  SupplementLog[]
  milestones      Milestone[]
  weeklyReviews   WeeklyReview[]
  dailyMetrics    DailyMetric[]

  @@map("users")
}

// Schedule Management
model TimeBlock {
  id          String            @id @default(cuid())
  userId      String
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  category    TimeBlockCategory
  completed   Boolean           @default(false)
  notes       String?
  pomodoroCount Int?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("time_blocks")
}

enum TimeBlockCategory {
  DEEP_WORK_DSA
  DEEP_WORK_DENTENSUR
  DEEP_WORK_NURTUREBEAST
  DEEP_WORK_AI_BARD
  CLASS_ME61011
  CLASS_ME60231
  MEAL_BREAKFAST
  MEAL_LUNCH
  MEAL_DINNER
  MEAL_LATE
  WORKOUT_UPPER_1
  WORKOUT_LOWER_1
  WORKOUT_UPPER_2
  WORKOUT_LOWER_2
  HIIT_MORNING
  MOBILITY_MORNING
  MOBILITY_EVENING
  MEDITATION
  BUFFER_TIME
  SLEEP
  TRAVEL
  SOCIAL_FREE
}

// Workout Tracking
model WorkoutSession {
  id        String      @id @default(cuid())
  userId    String
  date      DateTime
  type      WorkoutType
  completed Boolean     @default(false)
  duration  Int?        // minutes
  notes     String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises WorkoutExercise[]

  @@map("workout_sessions")
}

model WorkoutExercise {
  id          String @id @default(cuid())
  sessionId   String
  exerciseName String
  sets        Json   // ExerciseSet[]
  completed   Boolean @default(false)
  notes       String?

  session WorkoutSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@map("workout_exercises")
}

enum WorkoutType {
  UPPER_1_PUSH
  LOWER_1_QUAD
  UPPER_2_PULL
  LOWER_2_HAMSTRING_GLUTE
  HIIT_CARDIO
  MOBILITY_RECOVERY
}

// Nutrition Tracking
model MealEntry {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime
  mealType  MealType
  completed Boolean  @default(false)
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("meal_entries")
}

model SupplementLog {
  id             String         @id @default(cuid())
  userId         String
  date           DateTime
  supplementType SupplementType
  timing         String
  completed      Boolean        @default(false)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("supplement_logs")
}

enum MealType {
  BREAKFAST_MESS
  LUNCH_MESS
  DINNER_MESS
  POST_WORKOUT_SHAKE
  LATE_CHICKEN_MEAL
}

enum SupplementType {
  CREATINE_MONOHYDRATE
  WHEY_PROTEIN
  MILK_POST_WORKOUT
  MILK_PRE_SLEEP
}

// Progress & Goals
model Milestone {
  id          String           @id @default(cuid())
  userId      String
  category    MilestoneCategory
  title       String
  description String
  targetDate  DateTime?
  completed   Boolean          @default(false)
  progress    Int              @default(0) // 0-100
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("milestones")
}

model WeeklyReview {
  id            String   @id @default(cuid())
  userId        String
  weekStarting  DateTime
  workedWell    Json     // String[]
  challenges    Json     // String[]
  improvements  Json     // String[]
  overallRating Int      // 1-10
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("weekly_reviews")
}

enum MilestoneCategory {
  ACADEMIC_COURSEWORK
  ACADEMIC_GRADES
  PROFESSIONAL_DENTENSUR
  PROFESSIONAL_NURTUREBEAST
  PROFESSIONAL_AI_BARD
  FITNESS_STRENGTH
  FITNESS_PHYSIQUE
  PERSONAL_HABITS
  PERSONAL_SKILLS
}

// Analytics
model DailyMetric {
  id                String   @id @default(cuid())
  userId            String
  date              DateTime @unique
  scheduleAdherence Float    // 0-1
  workoutCompleted  Boolean  @default(false)
  deepWorkHours     Float    @default(0)
  sleepQuality      Int?     // 1-10
  energyLevel       Int?     // 1-10
  stressLevel       Int?     // 1-10
  pomodoroCount     Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("daily_metrics")
}
```

## Page-Specific Architecture

### 1. Dashboard Page (`/dashboard`)
**Purpose:** Central hub showing current day overview and quick actions

**Key Features:**
- Real-time schedule view with current activity highlighting
- Today's completion progress (schedule adherence, workout, nutrition)
- Quick action buttons (start pomodoro, log workout, add notes)
- Motivation metrics (current streaks, week progress)
- Weather-like interface showing "performance forecast"

**Components:**
- `ScheduleOverview` - Timeline view of today's schedule
- `CurrentActivity` - Highlighted current/next activity with timer
- `DailyProgress` - Circular progress indicators for key metrics
- `QuickActions` - CTA buttons for common tasks
- `MotivationMetrics` - Streak counters and achievement badges

### 2. Calendar Page (`/calendar`)
**Purpose:** Weekly/monthly schedule management and time blocking

**Key Features:**
- Interactive calendar with drag-and-drop time block editing
- Pomodoro timer integration for deep work sessions
- Color-coded categories matching the Lock-In Protocol
- Task notes and reflection capabilities for each time slot
- Schedule templates and quick scheduling tools

**Components:**
- `TimeBlockCalendar` - Main calendar interface
- `PomodoroTimer` - Integrated focus timer
- `ScheduleEditor` - Modal for editing time blocks
- `TaskNotes` - Reflection and notes interface

### 3. Workout Page (`/workout`)
**Purpose:** 4-day split tracking and exercise progression

**Key Features:**
- Workout logger with sets, reps, weight tracking
- Progressive overload calculator and recommendations
- HIIT morning routine timer (15-minute protocol)
- Mobility routine checklist (morning/evening)
- Workout history and strength progression charts
- Exercise database with form tips

**Components:**
- `WorkoutLogger` - Main exercise tracking interface
- `ExerciseTracker` - Individual exercise tracking
- `ProgressiveOverload` - Weight progression suggestions
- `HIITTimer` - 30s on/30s off interval timer
- `MobilityChecklist` - Dynamic stretching routines

### 4. Nutrition Page (`/nutrition`)
**Purpose:** Meal timing and supplement protocol tracking

**Key Features:**
- Meal timing tracker aligned with hostel mess schedule
- Supplement protocol reminders (creatine, protein, milk timing)
- Hydration tracking with smart reminders
- Nutrition analytics and macro estimation
- Meal planning templates

**Components:**
- `MealTracker` - Meal timing and completion tracking
- `SupplementLogger` - Supplement timing and logging
- `HydrationTracker` - Water intake monitoring
- `NutritionAnalytics` - Macro and timing analysis

### 5. Milestones Page (`/milestones`)
**Purpose:** Goal tracking across academic, professional, and personal domains

**Key Features:**
- Categorized goal tracking (Academic, Professional, Fitness, Personal)
- Progress indicators with milestone celebrations
- Habit streak tracking for consistency metrics
- Achievement badges and recognition system
- Goal decomposition into actionable steps

**Components:**
- `GoalTracker` - Main goal management interface
- `MilestoneCard` - Individual milestone display
- `HabitStreaks` - Consistency tracking
- `AchievementBadges` - Gamification elements

### 6. Progress Page (`/progress`)
**Purpose:** Analytics, trends, and weekly review system

**Key Features:**
- Automated analytics from tracked data
- Trend analysis charts (productivity, fitness, adherence)
- Weekly review interface following Sunday protocol
- Performance comparison (goal vs. actual)
- Reflection journal with guided prompts
- Exportable progress reports

**Components:**
- `AnalyticsDashboard` - Main analytics overview
- `TrendCharts` - Data visualization components
- `PerformanceMetrics` - KPI tracking
- `ReflectionJournal` - Weekly review interface

### 7. Strategy Page (`/strategy`)
**Purpose:** Weekly planning and schedule optimization

**Key Features:**
- Weekly planning interface with template application
- Schedule optimization tools and recommendations
- Buffer time management and default task protocols
- Goal setting and adjustment wizards
- Strategic review templates and frameworks
- Planning methodologies (Time blocking + Pomodoro integration)

**Components:**
- `WeeklyPlanner` - Schedule planning interface
- `ReviewInterface` - Strategic review tools
- `GoalSetter` - Goal creation and adjustment
- `OptimizationTools` - Schedule efficiency analysis

## Mobile-First Design Strategy

### Progressive Web App (PWA) Features
- **Offline functionality** for core tracking features
- **Push notifications** for schedule reminders
- **Home screen installation** for native app experience
- **Background sync** for data when connectivity returns

### Responsive Design Principles
- **Mobile-first approach** using Tailwind's responsive utilities
- **Touch-optimized interfaces** with minimum 44px tap targets
- **Gesture support** for swipe navigation and interactions
- **Condensed layouts** that prioritize essential information

### Performance Optimization
- **Code splitting** by page and component
- **Image optimization** with Next.js Image component
- **Lazy loading** for non-critical components
- **Service worker** for caching and offline support

## Notification System Architecture

### Notification Types
1. **Schedule Reminders**
   - Pre-activity notifications (5 minutes before)
   - Activity start notifications
   - Pomodoro break reminders

2. **Habit Tracking Nudges**
   - Morning HIIT reminder (5:25 AM)
   - Supplement timing alerts
   - Mobility routine prompts

3. **Progress Celebrations**
   - Streak milestone achievements
   - Goal completion notifications
   - Weekly progress summaries

4. **Strategic Prompts**
   - Weekly review reminders (Sunday morning)
   - Buffer time optimization suggestions
   - Schedule adherence insights

### Implementation Strategy
- **Browser Push API** for web notifications
- **Service Worker** for background processing
- **Local Storage** for notification preferences
- **Smart scheduling** to avoid notification fatigue

## Development Phases

### Phase 1: Foundation Setup
1. Next.js project initialization with TypeScript
2. Tailwind CSS and shadcn/ui component setup
3. Supabase database and authentication configuration
4. Prisma schema implementation and migration
5. Basic routing and layout structure

### Phase 2: Core Features
1. Dashboard page with schedule overview
2. Calendar page with time blocking
3. Basic workout tracking functionality
4. Simple nutrition logging
5. User authentication and data persistence

### Phase 3: Advanced Features
1. Pomodoro timer integration
2. Progressive overload calculations
3. Analytics and progress tracking
4. Weekly review system
5. Notification system implementation

### Phase 4: Polish & Deployment
1. Mobile responsiveness optimization
2. PWA implementation
3. Performance optimization
4. Comprehensive testing
5. Vercel deployment with database integration

## Environment Setup Requirements

### Dependencies
```json
{
  "dependencies": {
    "@next/font": "13.x",
    "@prisma/client": "^5.x",
    "@radix-ui/react-*": "latest",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "framer-motion": "^10.x",
    "lucide-react": "latest",
    "next": "14.x",
    "react": "18.x",
    "react-dom": "18.x",
    "react-hook-form": "^7.x",
    "recharts": "^2.x",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "eslint-config-next": "14.x",
    "postcss": "^8.x",
    "prisma": "^5.x",
    "tailwindcss": "^3.x",
    "typescript": "^5.x"
  }
}
```

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# App Configuration
NEXT_PUBLIC_APP_URL=
NEXTAUTH_SECRET=
```

## Success Metrics

### Technical Metrics
- **Page load speed** < 2 seconds
- **Mobile lighthouse score** > 90
- **Offline functionality** for core features
- **Cross-browser compatibility**

### User Experience Metrics
- **Schedule adherence tracking** accuracy
- **Data input efficiency** (minimal friction)
- **Notification effectiveness** (actionable, timely)
- **Progress visualization** clarity

### Business/Personal Metrics
- **Daily active usage** consistency
- **Feature adoption** rates
- **Goal achievement** correlation
- **Long-term engagement** sustainability

This documentation provides a comprehensive roadmap for building the Lock-In Protocol webapp. Each section can be implemented incrementally, allowing for iterative development and continuous improvement based on real-world usage patterns.