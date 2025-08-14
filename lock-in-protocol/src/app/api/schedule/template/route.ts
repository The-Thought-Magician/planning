import { NextRequest } from 'next/server'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  methodNotAllowed,
  handleOptions,
  API_ERRORS
} from '@/lib/api-utils'
import { TimeBlockCategory } from '@prisma/client'

// GET /api/schedule/template - Get default schedule template
export async function GET() {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    // Default Lock-In Protocol Schedule Template
    const template = {
      name: "Lock-In Protocol Weekly Template",
      description: "Optimized schedule for academic excellence and fitness goals",
      weeklyStructure: {
        monday: [
          {
            title: "Morning Mobility & Meditation",
            startTime: "06:00",
            endTime: "06:30",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Joint mobility routine and 10-min meditation"
          },
          {
            title: "HIIT Cardio Session",
            startTime: "06:30",
            endTime: "07:00",
            category: TimeBlockCategory.HIIT_MORNING,
            description: "High-intensity interval training"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "07:30",
            endTime: "08:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Mess breakfast + creatine + whey protein"
          },
          {
            title: "Deep Work - DSA Practice",
            startTime: "09:00",
            endTime: "11:30",
            category: TimeBlockCategory.DEEP_WORK_DSA,
            description: "Data Structures & Algorithms focused work (5 Pomodoros)"
          },
          {
            title: "ME61011 Class",
            startTime: "12:00",
            endTime: "13:00",
            category: TimeBlockCategory.CLASS_ME61011,
            description: "Manufacturing Systems class"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Mess lunch"
          },
          {
            title: "Upper 1 Push Workout",
            startTime: "15:00",
            endTime: "16:30",
            category: TimeBlockCategory.WORKOUT_UPPER_1,
            description: "Chest, shoulders, triceps focus"
          },
          {
            title: "Post-Workout Nutrition",
            startTime: "16:30",
            endTime: "17:00",
            category: TimeBlockCategory.MEAL_LATE,
            description: "Protein shake + milk"
          },
          {
            title: "Deep Work - DentenSur",
            startTime: "18:00",
            endTime: "20:30",
            category: TimeBlockCategory.DEEP_WORK_DENTENSUR,
            description: "DentenSur project work (5 Pomodoros)"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Mess dinner"
          },
          {
            title: "Evening Mobility",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Stretching and relaxation"
          },
          {
            title: "Sleep",
            startTime: "23:00",
            endTime: "06:00",
            category: TimeBlockCategory.SLEEP,
            description: "8 hours of quality sleep"
          }
        ],
        tuesday: [
          {
            title: "Morning Mobility & Meditation",
            startTime: "06:00",
            endTime: "06:30",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Joint mobility routine and 10-min meditation"
          },
          {
            title: "HIIT Cardio Session",
            startTime: "06:30",
            endTime: "07:00",
            category: TimeBlockCategory.HIIT_MORNING,
            description: "High-intensity interval training"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "07:30",
            endTime: "08:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Mess breakfast + creatine"
          },
          {
            title: "Deep Work - NurtureBeast",
            startTime: "09:00",
            endTime: "11:30",
            category: TimeBlockCategory.DEEP_WORK_NURTUREBEAST,
            description: "NurtureBeast project development (5 Pomodoros)"
          },
          {
            title: "ME60231 Class",
            startTime: "12:00",
            endTime: "13:00",
            category: TimeBlockCategory.CLASS_ME60231,
            description: "Advanced Manufacturing class"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Mess lunch"
          },
          {
            title: "Lower 1 Quad Workout",
            startTime: "15:00",
            endTime: "16:30",
            category: TimeBlockCategory.WORKOUT_LOWER_1,
            description: "Quads, glutes, calves focus"
          },
          {
            title: "Post-Workout Nutrition",
            startTime: "16:30",
            endTime: "17:00",
            category: TimeBlockCategory.MEAL_LATE,
            description: "Protein shake + milk"
          },
          {
            title: "Deep Work - AI Bard",
            startTime: "18:00",
            endTime: "20:30",
            category: TimeBlockCategory.DEEP_WORK_AI_BARD,
            description: "AI Bard project work (5 Pomodoros)"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Mess dinner"
          },
          {
            title: "Late Chicken Meal",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MEAL_LATE,
            description: "High-protein chicken meal + pre-sleep milk"
          },
          {
            title: "Sleep",
            startTime: "23:00",
            endTime: "06:00",
            category: TimeBlockCategory.SLEEP,
            description: "8 hours of quality sleep"
          }
        ],
        wednesday: [
          // Similar structure - Upper 2 Pull workout day
          {
            title: "Morning Mobility & Meditation",
            startTime: "06:00",
            endTime: "06:30",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Joint mobility routine and 10-min meditation"
          },
          {
            title: "HIIT Cardio Session",
            startTime: "06:30",
            endTime: "07:00",
            category: TimeBlockCategory.HIIT_MORNING,
            description: "High-intensity interval training"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "07:30",
            endTime: "08:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Mess breakfast + creatine + whey protein"
          },
          {
            title: "Deep Work - DSA Practice",
            startTime: "09:00",
            endTime: "11:30",
            category: TimeBlockCategory.DEEP_WORK_DSA,
            description: "Advanced problem solving (5 Pomodoros)"
          },
          {
            title: "ME61011 Class",
            startTime: "12:00",
            endTime: "13:00",
            category: TimeBlockCategory.CLASS_ME61011,
            description: "Manufacturing Systems class"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Mess lunch"
          },
          {
            title: "Upper 2 Pull Workout",
            startTime: "15:00",
            endTime: "16:30",
            category: TimeBlockCategory.WORKOUT_UPPER_2,
            description: "Back, rear delts, biceps focus"
          },
          {
            title: "Post-Workout Nutrition",
            startTime: "16:30",
            endTime: "17:00",
            category: TimeBlockCategory.MEAL_LATE,
            description: "Protein shake + milk"
          },
          {
            title: "Deep Work - DentenSur",
            startTime: "18:00",
            endTime: "20:30",
            category: TimeBlockCategory.DEEP_WORK_DENTENSUR,
            description: "Feature development (5 Pomodoros)"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Mess dinner"
          },
          {
            title: "Evening Mobility",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Stretching and relaxation"
          },
          {
            title: "Sleep",
            startTime: "23:00",
            endTime: "06:00",
            category: TimeBlockCategory.SLEEP,
            description: "8 hours of quality sleep"
          }
        ],
        thursday: [
          // Similar structure - Lower 2 Hamstring/Glute day
          {
            title: "Morning Mobility & Meditation",
            startTime: "06:00",
            endTime: "06:30",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Joint mobility routine and 10-min meditation"
          },
          {
            title: "HIIT Cardio Session",
            startTime: "06:30",
            endTime: "07:00",
            category: TimeBlockCategory.HIIT_MORNING,
            description: "High-intensity interval training"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "07:30",
            endTime: "08:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Mess breakfast + creatine"
          },
          {
            title: "Deep Work - NurtureBeast",
            startTime: "09:00",
            endTime: "11:30",
            category: TimeBlockCategory.DEEP_WORK_NURTUREBEAST,
            description: "Backend optimization (5 Pomodoros)"
          },
          {
            title: "ME60231 Class",
            startTime: "12:00",
            endTime: "13:00",
            category: TimeBlockCategory.CLASS_ME60231,
            description: "Advanced Manufacturing class"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Mess lunch"
          },
          {
            title: "Lower 2 Hamstring/Glute Workout",
            startTime: "15:00",
            endTime: "16:30",
            category: TimeBlockCategory.WORKOUT_LOWER_2,
            description: "Hamstrings, glutes, posterior chain focus"
          },
          {
            title: "Post-Workout Nutrition",
            startTime: "16:30",
            endTime: "17:00",
            category: TimeBlockCategory.MEAL_LATE,
            description: "Protein shake + milk"
          },
          {
            title: "Deep Work - AI Bard",
            startTime: "18:00",
            endTime: "20:30",
            category: TimeBlockCategory.DEEP_WORK_AI_BARD,
            description: "Model training and testing (5 Pomodoros)"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Mess dinner"
          },
          {
            title: "Late Chicken Meal",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MEAL_LATE,
            description: "High-protein chicken meal + pre-sleep milk"
          },
          {
            title: "Sleep",
            startTime: "23:00",
            endTime: "06:00",
            category: TimeBlockCategory.SLEEP,
            description: "8 hours of quality sleep"
          }
        ],
        friday: [
          // Active recovery day
          {
            title: "Extended Morning Mobility",
            startTime: "06:00",
            endTime: "07:00",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Extended mobility and meditation session"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "07:30",
            endTime: "08:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Mess breakfast + creatine + whey protein"
          },
          {
            title: "Deep Work - DSA Review",
            startTime: "09:00",
            endTime: "11:30",
            category: TimeBlockCategory.DEEP_WORK_DSA,
            description: "Week review and problem analysis (5 Pomodoros)"
          },
          {
            title: "ME61011 Class",
            startTime: "12:00",
            endTime: "13:00",
            category: TimeBlockCategory.CLASS_ME61011,
            description: "Manufacturing Systems class"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Mess lunch"
          },
          {
            title: "Active Recovery Session",
            startTime: "15:00",
            endTime: "16:00",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Light movement, stretching, foam rolling"
          },
          {
            title: "Buffer Time / Social",
            startTime: "16:00",
            endTime: "18:00",
            category: TimeBlockCategory.SOCIAL_FREE,
            description: "Flexible time for social activities or catch-up"
          },
          {
            title: "Weekly Review & Planning",
            startTime: "18:00",
            endTime: "20:30",
            category: TimeBlockCategory.DEEP_WORK_DSA,
            description: "Week reflection and next week planning"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Mess dinner"
          },
          {
            title: "Evening Mobility",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Relaxing stretches"
          },
          {
            title: "Sleep",
            startTime: "23:00",
            endTime: "06:00",
            category: TimeBlockCategory.SLEEP,
            description: "8 hours of quality sleep"
          }
        ],
        saturday: [
          // Flexible weekend day
          {
            title: "Late Wake Up & Mobility",
            startTime: "07:00",
            endTime: "08:00",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Gentle morning routine"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "08:30",
            endTime: "09:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Relaxed breakfast + supplements"
          },
          {
            title: "Project Work - Flexible",
            startTime: "10:00",
            endTime: "12:30",
            category: TimeBlockCategory.DEEP_WORK_NURTUREBEAST,
            description: "Choose highest priority project (5 Pomodoros)"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Weekend lunch"
          },
          {
            title: "Buffer Time / Activities",
            startTime: "14:00",
            endTime: "18:00",
            category: TimeBlockCategory.SOCIAL_FREE,
            description: "Flexible time for personal activities"
          },
          {
            title: "Optional Evening Work",
            startTime: "18:00",
            endTime: "20:00",
            category: TimeBlockCategory.DEEP_WORK_AI_BARD,
            description: "Optional focused work session"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Weekend dinner"
          },
          {
            title: "Evening Relaxation",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Relaxing activities"
          },
          {
            title: "Sleep",
            startTime: "23:30",
            endTime: "07:00",
            category: TimeBlockCategory.SLEEP,
            description: "7.5 hours of quality sleep"
          }
        ],
        sunday: [
          // Recovery and preparation day
          {
            title: "Late Wake Up & Mobility",
            startTime: "07:00",
            endTime: "08:00",
            category: TimeBlockCategory.MOBILITY_MORNING,
            description: "Gentle morning routine"
          },
          {
            title: "Breakfast & Supplements",
            startTime: "08:30",
            endTime: "09:30",
            category: TimeBlockCategory.MEAL_BREAKFAST,
            description: "Relaxed breakfast + supplements"
          },
          {
            title: "Weekly Meal Prep",
            startTime: "10:00",
            endTime: "12:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Prepare meals and supplements for the week"
          },
          {
            title: "Lunch",
            startTime: "13:00",
            endTime: "14:00",
            category: TimeBlockCategory.MEAL_LUNCH,
            description: "Sunday lunch"
          },
          {
            title: "Full Body Mobility Session",
            startTime: "15:00",
            endTime: "16:30",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Comprehensive mobility and recovery work"
          },
          {
            title: "Week Planning Session",
            startTime: "17:00",
            endTime: "18:30",
            category: TimeBlockCategory.DEEP_WORK_DSA,
            description: "Detailed planning for upcoming week"
          },
          {
            title: "Dinner",
            startTime: "20:30",
            endTime: "21:30",
            category: TimeBlockCategory.MEAL_DINNER,
            description: "Sunday dinner"
          },
          {
            title: "Evening Preparation",
            startTime: "22:00",
            endTime: "22:30",
            category: TimeBlockCategory.MOBILITY_EVENING,
            description: "Prepare for Monday restart"
          },
          {
            title: "Sleep",
            startTime: "23:00",
            endTime: "06:00",
            category: TimeBlockCategory.SLEEP,
            description: "8 hours of quality sleep"
          }
        ]
      },
      workoutSplit: {
        "4-day-split": {
          day1: {
            type: "UPPER_1_PUSH",
            focus: "Chest, Shoulders, Triceps",
            exercises: [
              "Barbell Bench Press",
              "Overhead Press", 
              "Incline Dumbbell Press",
              "Dips",
              "Lateral Raises",
              "Tricep Close-Grip Press"
            ]
          },
          day2: {
            type: "LOWER_1_QUAD",
            focus: "Quads, Glutes, Calves",
            exercises: [
              "Back Squats",
              "Bulgarian Split Squats",
              "Leg Press",
              "Walking Lunges",
              "Calf Raises",
              "Leg Extensions"
            ]
          },
          day3: {
            type: "UPPER_2_PULL",
            focus: "Back, Rear Delts, Biceps",
            exercises: [
              "Deadlifts",
              "Pull-ups/Chin-ups",
              "Barbell Rows",
              "Face Pulls",
              "Barbell Curls",
              "Hammer Curls"
            ]
          },
          day4: {
            type: "LOWER_2_HAMSTRING_GLUTE",
            focus: "Hamstrings, Glutes, Posterior Chain",
            exercises: [
              "Romanian Deadlifts",
              "Hip Thrusts",
              "Good Mornings",
              "Leg Curls",
              "Single Leg RDLs",
              "Glute Ham Raises"
            ]
          }
        }
      },
      nutritionGuidelines: {
        supplementSchedule: {
          morning: ["Creatine Monohydrate (5g)", "Whey Protein (25g)"],
          postWorkout: ["Whey Protein (25g)", "Milk (250ml)"],
          preSleep: ["Milk (250ml)"]
        },
        mealTiming: {
          breakfast: "07:30-08:30",
          lunch: "13:00-14:00", 
          postWorkout: "16:30-17:00",
          dinner: "20:30-21:30",
          lateSnack: "22:00-22:30"
        },
        hydrationTarget: "3-4 liters per day"
      },
      pomodoroSettings: {
        workDuration: 25,
        shortBreak: 5,
        longBreak: 15,
        longBreakInterval: 4
      }
    }

    return createSuccessResponse(template, 'Default schedule template retrieved successfully')

  } catch (error) {
    console.error('Get schedule template error:', error)
    return createErrorResponse(API_ERRORS.INTERNAL_ERROR)
  }
}

export async function OPTIONS() {
  return handleOptions()
}

export async function POST() {
  return methodNotAllowed(['GET'])
}

export async function PUT() {
  return methodNotAllowed(['GET'])
}

export async function PATCH() {
  return methodNotAllowed(['GET'])
}

export async function DELETE() {
  return methodNotAllowed(['GET'])
}