# Lock-In Protocol

A comprehensive personal productivity webapp for tracking schedule adherence, workouts, nutrition, milestones, and analytics.

## Features

### 🏃‍♂️ Workout Tracking
- **4-Day Split Program**: Upper 1, Lower 1, Upper 2, Lower 2
- **Exercise Logging**: Track sets, reps, weights, and RPE
- **Progressive Overload Calculator**: Smart recommendations for weight increases
- **HIIT Timer**: Customizable intervals (30s work/30s rest default)
- **Mobility Routines**: Morning, evening, and recovery sessions

### 🍽️ Nutrition Management
- **Meal Timing Tracker**: 5 meal schedule with timing optimization
- **Supplement Protocol**: Creatine, protein, and milk timing
- **Hydration Tracker**: Daily water intake with streak tracking
- **Nutrition Analytics**: Detailed insights and adherence rates

### 🎯 Milestones & Goals
- **Multi-Category Tracking**: Academic, Professional, Fitness, Personal
- **Goal Progress**: Visual progress indicators and completion tracking
- **Habit Streaks**: Daily habit consistency monitoring
- **Achievement Badges**: Unlock rewards for reaching milestones

### 📊 Progress Analytics
- **Performance Metrics**: Productivity scores, energy levels, focus ratings
- **Weekly Reviews**: Structured reflection and improvement planning
- **Trend Visualization**: Charts and graphs using Recharts
- **Goal vs Actual**: Compare planned vs actual performance

### 📅 Strategic Planning
- **Weekly Planner**: Drag-and-drop task scheduling
- **Schedule Optimizer**: AI-powered efficiency recommendations
- **Goal Setting Wizard**: Step-by-step goal creation process
- **Strategic Reviews**: Quarterly performance analysis

### 📱 Dashboard & Calendar
- **Real-time Dashboard**: Current activity, daily progress, quick actions
- **Time-Block Calendar**: Visual schedule with pomodoro integration
- **Schedule Editor**: Easy time block management
- **Motivation Metrics**: Stay motivated with progress tracking

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth (configured for single-user)
- **Charts**: Recharts for data visualization
- **State Management**: React hooks and context
- **UI Components**: Radix UI primitives via shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Supabase account (optional, for auth)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lock-in-protocol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `DATABASE_URL`: Your PostgreSQL connection string

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

The application uses Prisma with PostgreSQL. The schema includes:

- **Users**: Single-user authentication setup
- **TimeBlocks**: Schedule management and time tracking
- **WorkoutSessions**: Exercise logging and workout tracking
- **MealEntries**: Nutrition and meal timing
- **SupplementLogs**: Supplement protocol tracking
- **Milestones**: Goal and milestone management
- **WeeklyReviews**: Reflection and improvement tracking
- **DailyMetrics**: Performance and analytics data

## Usage

### Authentication

The app is configured for single-user usage. Set up your Supabase credentials or use the demo login:
- Email: your configured email
- Password: your configured password

### Navigation

- **Dashboard**: Overview of today's activities and progress
- **Calendar**: Time-blocked schedule with pomodoro sessions
- **Workout**: Exercise tracking, HIIT timer, and mobility routines
- **Nutrition**: Meal timing, supplements, and hydration tracking
- **Milestones**: Goal setting, habit streaks, and achievements
- **Progress**: Analytics, performance metrics, and weekly reviews
- **Strategy**: Weekly planning, schedule optimization, and strategic reviews

### Key Workflows

1. **Daily Planning**: Start in the Calendar to view and adjust your schedule
2. **Workout Logging**: Use the Workout tab to track exercises and progress
3. **Meal Tracking**: Log meals and supplements in the Nutrition section
4. **Progress Review**: Check your Analytics and complete weekly reviews
5. **Strategic Planning**: Use the Strategy section for long-term goal setting

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Database Commands

- `npx prisma studio`: Open database browser
- `npx prisma db push`: Push schema changes
- `npx prisma generate`: Generate Prisma client
- `npx prisma migrate dev`: Create and apply migrations

### Adding New Components

The project uses shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── (app)/          # Main application routes
│   ├── (auth)/         # Authentication routes
│   └── api/            # API routes
├── components/         # React components
│   ├── ui/             # shadcn/ui components
│   ├── dashboard/      # Dashboard components
│   ├── calendar/       # Calendar components
│   ├── workout/        # Workout components
│   ├── nutrition/      # Nutrition components
│   ├── milestones/     # Milestones components
│   ├── progress/       # Progress components
│   └── strategy/       # Strategy components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Contributing

This is a personal productivity system, but suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and intended for personal use.

## Support

For questions or issues, create an issue in the repository.
