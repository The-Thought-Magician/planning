import { TimeBlockCategory, WorkoutType, MealType, SupplementType, MilestoneCategory } from '@prisma/client'

export const TIME_BLOCK_CATEGORIES = {
  DEEP_WORK_DSA: { label: 'DSA Deep Work', color: '#3B82F6', icon: '💻' },
  DEEP_WORK_DENTENSUR: { label: 'Dentensur Deep Work', color: '#8B5CF6', icon: '🦷' },
  DEEP_WORK_NURTUREBEAST: { label: 'NurtureBeast Deep Work', color: '#EF4444', icon: '🦁' },
  DEEP_WORK_AI_BARD: { label: 'AI Bard Deep Work', color: '#F59E0B', icon: '🤖' },
  CLASS_ME61011: { label: 'ME61011 Class', color: '#10B981', icon: '📚' },
  CLASS_ME60231: { label: 'ME60231 Class', color: '#14B8A6', icon: '📖' },
  MEAL_BREAKFAST: { label: 'Breakfast', color: '#F97316', icon: '🍳' },
  MEAL_LUNCH: { label: 'Lunch', color: '#F97316', icon: '🍽️' },
  MEAL_DINNER: { label: 'Dinner', color: '#F97316', icon: '🍛' },
  MEAL_LATE: { label: 'Late Meal', color: '#F97316', icon: '🥗' },
  WORKOUT_UPPER_1: { label: 'Upper Body 1', color: '#DC2626', icon: '💪' },
  WORKOUT_LOWER_1: { label: 'Lower Body 1', color: '#DC2626', icon: '🦵' },
  WORKOUT_UPPER_2: { label: 'Upper Body 2', color: '#DC2626', icon: '💪' },
  WORKOUT_LOWER_2: { label: 'Lower Body 2', color: '#DC2626', icon: '🦵' },
  HIIT_MORNING: { label: 'Morning HIIT', color: '#EF4444', icon: '🏃' },
  MOBILITY_MORNING: { label: 'Morning Mobility', color: '#84CC16', icon: '🧘' },
  MOBILITY_EVENING: { label: 'Evening Mobility', color: '#84CC16', icon: '🧘' },
  MEDITATION: { label: 'Meditation', color: '#6366F1', icon: '🧘‍♂️' },
  BUFFER_TIME: { label: 'Buffer Time', color: '#6B7280', icon: '⏰' },
  SLEEP: { label: 'Sleep', color: '#1F2937', icon: '😴' },
  TRAVEL: { label: 'Travel', color: '#6B7280', icon: '🚗' },
  SOCIAL_FREE: { label: 'Social/Free', color: '#EC4899', icon: '👥' },
} as const

export const WORKOUT_TYPES = {
  UPPER_1_PUSH: { label: 'Upper Push (Day 1)', description: 'Chest, Shoulders, Triceps' },
  LOWER_1_QUAD: { label: 'Lower Quad (Day 1)', description: 'Quadriceps, Calves' },
  UPPER_2_PULL: { label: 'Upper Pull (Day 2)', description: 'Back, Biceps' },
  LOWER_2_HAMSTRING_GLUTE: { label: 'Lower Ham/Glute (Day 2)', description: 'Hamstrings, Glutes' },
  HIIT_CARDIO: { label: 'HIIT Cardio', description: '15-minute morning routine' },
  MOBILITY_RECOVERY: { label: 'Mobility & Recovery', description: 'Stretching and mobility work' },
} as const

export const MEAL_TYPES = {
  BREAKFAST_MESS: { label: 'Breakfast (Mess)', time: '08:00', icon: '🍳' },
  LUNCH_MESS: { label: 'Lunch (Mess)', time: '13:00', icon: '🍽️' },
  DINNER_MESS: { label: 'Dinner (Mess)', time: '20:00', icon: '🍛' },
  POST_WORKOUT_SHAKE: { label: 'Post-Workout Shake', time: 'Variable', icon: '🥤' },
  LATE_CHICKEN_MEAL: { label: 'Late Chicken Meal', time: '22:30', icon: '🍗' },
} as const

export const SUPPLEMENT_TYPES = {
  CREATINE_MONOHYDRATE: { label: 'Creatine Monohydrate', dosage: '3-5g', timing: 'Post-workout' },
  WHEY_PROTEIN: { label: 'Whey Protein', dosage: '25-30g', timing: 'Post-workout' },
  MILK_POST_WORKOUT: { label: 'Milk (Post-Workout)', dosage: '300ml', timing: 'Post-workout' },
  MILK_PRE_SLEEP: { label: 'Milk (Pre-Sleep)', dosage: '200ml', timing: 'Before bed' },
} as const

export const MILESTONE_CATEGORIES = {
  ACADEMIC_COURSEWORK: { label: 'Academic Coursework', icon: '📚', color: '#3B82F6' },
  ACADEMIC_GRADES: { label: 'Academic Grades', icon: '🎓', color: '#1D4ED8' },
  PROFESSIONAL_DENTENSUR: { label: 'Dentensur (Professional)', icon: '🦷', color: '#8B5CF6' },
  PROFESSIONAL_NURTUREBEAST: { label: 'NurtureBeast (Professional)', icon: '🦁', color: '#EF4444' },
  PROFESSIONAL_AI_BARD: { label: 'AI Bard (Professional)', icon: '🤖', color: '#F59E0B' },
  FITNESS_STRENGTH: { label: 'Fitness Strength', icon: '💪', color: '#DC2626' },
  FITNESS_PHYSIQUE: { label: 'Fitness Physique', icon: '🏋️', color: '#B91C1C' },
  PERSONAL_HABITS: { label: 'Personal Habits', icon: '🎯', color: '#059669' },
  PERSONAL_SKILLS: { label: 'Personal Skills', icon: '🌟', color: '#7C3AED' },
} as const

export const POMODORO_SETTINGS = {
  WORK_DURATION: 25, // minutes
  SHORT_BREAK: 5, // minutes
  LONG_BREAK: 15, // minutes
  LONG_BREAK_INTERVAL: 4, // after how many pomodoros
} as const

export const HIIT_PROTOCOL = {
  WORK_DURATION: 30, // seconds
  REST_DURATION: 30, // seconds
  TOTAL_ROUNDS: 15,
  TOTAL_DURATION: 15, // minutes
} as const

export const NAVIGATION_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/workout', label: 'Workout', icon: '💪' },
  { href: '/nutrition', label: 'Nutrition', icon: '🥗' },
  { href: '/milestones', label: 'Milestones', icon: '🎯' },
  { href: '/progress', label: 'Progress', icon: '📈' },
  { href: '/strategy', label: 'Strategy', icon: '🧠' },
] as const

export const DAILY_SCHEDULE_TEMPLATE = {
  '05:25': { category: 'HIIT_MORNING' as TimeBlockCategory, duration: 15 },
  '05:45': { category: 'MOBILITY_MORNING' as TimeBlockCategory, duration: 10 },
  '06:00': { category: 'BUFFER_TIME' as TimeBlockCategory, duration: 120 },
  '08:00': { category: 'MEAL_BREAKFAST' as TimeBlockCategory, duration: 30 },
  '09:00': { category: 'DEEP_WORK_DSA' as TimeBlockCategory, duration: 180 },
  '13:00': { category: 'MEAL_LUNCH' as TimeBlockCategory, duration: 60 },
  '14:30': { category: 'CLASS_ME61011' as TimeBlockCategory, duration: 90 },
  '16:30': { category: 'WORKOUT_UPPER_1' as TimeBlockCategory, duration: 90 },
  '18:30': { category: 'BUFFER_TIME' as TimeBlockCategory, duration: 90 },
  '20:00': { category: 'MEAL_DINNER' as TimeBlockCategory, duration: 45 },
  '21:00': { category: 'DEEP_WORK_DENTENSUR' as TimeBlockCategory, duration: 120 },
  '22:30': { category: 'MEAL_LATE' as TimeBlockCategory, duration: 30 },
  '23:00': { category: 'MOBILITY_EVENING' as TimeBlockCategory, duration: 15 },
  '23:30': { category: 'BUFFER_TIME' as TimeBlockCategory, duration: 30 },
  '00:00': { category: 'SLEEP' as TimeBlockCategory, duration: 325 },
}