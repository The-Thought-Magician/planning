import { NextRequest } from 'next/server'
import { 
  authenticateUser, 
  createErrorResponse, 
  createSuccessResponse,
  methodNotAllowed,
  handleOptions,
  API_ERRORS
} from '@/lib/api-utils'
import { WorkoutType } from '@prisma/client'

// GET /api/workouts/templates - Get workout templates by type
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await authenticateUser()
    
    if (error || !user) {
      return createErrorResponse(API_ERRORS.UNAUTHORIZED, 401)
    }

    const url = new URL(request.url)
    const type = url.searchParams.get('type') as WorkoutType

    // Define workout templates based on the 4-day split
    const workoutTemplates = {
      [WorkoutType.UPPER_1_PUSH]: {
        name: "Upper 1 - Push Focus",
        description: "Chest, Shoulders, Triceps",
        estimatedDuration: 90,
        targetMuscleGroups: ["chest", "shoulders", "triceps"],
        exercises: [
          {
            name: "Barbell Bench Press",
            type: "compound",
            primaryMuscle: "chest",
            sets: [
              { reps: 8, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 6, weight: 0, rpe: 9 },
              { reps: 6, weight: 0, rpe: 9 }
            ],
            restTime: 180,
            notes: "Controlled eccentric, explosive concentric"
          },
          {
            name: "Overhead Press",
            type: "compound",
            primaryMuscle: "shoulders",
            sets: [
              { reps: 8, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 6, weight: 0, rpe: 8 }
            ],
            restTime: 180,
            notes: "Full range of motion, core tight"
          },
          {
            name: "Incline Dumbbell Press",
            type: "compound",
            primaryMuscle: "chest",
            sets: [
              { reps: 10, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 9 }
            ],
            restTime: 120,
            notes: "30-45 degree incline, full stretch"
          },
          {
            name: "Dips",
            type: "compound",
            primaryMuscle: "triceps",
            sets: [
              { reps: 12, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 9 }
            ],
            restTime: 90,
            notes: "Lean forward for chest emphasis"
          },
          {
            name: "Lateral Raises",
            type: "isolation",
            primaryMuscle: "shoulders",
            sets: [
              { reps: 15, weight: 0, rpe: 7 },
              { reps: 12, weight: 0, rpe: 8 },
              { reps: 10, weight: 0, rpe: 9 }
            ],
            restTime: 60,
            notes: "Slight forward lean, controlled tempo"
          },
          {
            name: "Close-Grip Bench Press",
            type: "compound",
            primaryMuscle: "triceps",
            sets: [
              { reps: 12, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 9 }
            ],
            restTime: 90,
            notes: "Hands shoulder-width apart, elbows tucked"
          }
        ]
      },
      [WorkoutType.LOWER_1_QUAD]: {
        name: "Lower 1 - Quad Focus",
        description: "Quads, Glutes, Calves",
        estimatedDuration: 90,
        targetMuscleGroups: ["quads", "glutes", "calves"],
        exercises: [
          {
            name: "Back Squats",
            type: "compound",
            primaryMuscle: "quads",
            sets: [
              { reps: 8, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 6, weight: 0, rpe: 9 },
              { reps: 6, weight: 0, rpe: 9 }
            ],
            restTime: 240,
            notes: "Full depth, knees track over toes"
          },
          {
            name: "Bulgarian Split Squats",
            type: "unilateral",
            primaryMuscle: "quads",
            sets: [
              { reps: 10, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 8 }
            ],
            restTime: 90,
            notes: "Each leg, front foot planted, controlled descent"
          },
          {
            name: "Leg Press",
            type: "compound",
            primaryMuscle: "quads",
            sets: [
              { reps: 15, weight: 0, rpe: 7 },
              { reps: 12, weight: 0, rpe: 8 },
              { reps: 10, weight: 0, rpe: 9 }
            ],
            restTime: 120,
            notes: "Full range of motion, controlled negative"
          },
          {
            name: "Walking Lunges",
            type: "unilateral",
            primaryMuscle: "quads",
            sets: [
              { reps: 20, weight: 0, rpe: 7 },
              { reps: 16, weight: 0, rpe: 8 },
              { reps: 12, weight: 0, rpe: 8 }
            ],
            restTime: 90,
            notes: "Alternate legs, long stride, knee doesn't touch ground"
          },
          {
            name: "Standing Calf Raises",
            type: "isolation",
            primaryMuscle: "calves",
            sets: [
              { reps: 20, weight: 0, rpe: 7 },
              { reps: 15, weight: 0, rpe: 8 },
              { reps: 12, weight: 0, rpe: 9 }
            ],
            restTime: 60,
            notes: "Full stretch at bottom, pause at top"
          },
          {
            name: "Leg Extensions",
            type: "isolation",
            primaryMuscle: "quads",
            sets: [
              { reps: 15, weight: 0, rpe: 7 },
              { reps: 12, weight: 0, rpe: 8 },
              { reps: 10, weight: 0, rpe: 9 }
            ],
            restTime: 60,
            notes: "Slow controlled movement, squeeze at top"
          }
        ]
      },
      [WorkoutType.UPPER_2_PULL]: {
        name: "Upper 2 - Pull Focus", 
        description: "Back, Rear Delts, Biceps",
        estimatedDuration: 90,
        targetMuscleGroups: ["back", "rear delts", "biceps"],
        exercises: [
          {
            name: "Conventional Deadlifts",
            type: "compound",
            primaryMuscle: "back",
            sets: [
              { reps: 6, weight: 0, rpe: 7 },
              { reps: 6, weight: 0, rpe: 8 },
              { reps: 4, weight: 0, rpe: 9 },
              { reps: 4, weight: 0, rpe: 9 }
            ],
            restTime: 240,
            notes: "Hip hinge pattern, neutral spine, explosive pull"
          },
          {
            name: "Pull-ups/Chin-ups",
            type: "compound",
            primaryMuscle: "back",
            sets: [
              { reps: 10, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 6, weight: 0, rpe: 9 }
            ],
            restTime: 180,
            notes: "Full range of motion, controlled eccentric"
          },
          {
            name: "Barbell Rows",
            type: "compound", 
            primaryMuscle: "back",
            sets: [
              { reps: 10, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 8 }
            ],
            restTime: 120,
            notes: "45-degree torso angle, pull to lower chest"
          },
          {
            name: "Face Pulls",
            type: "isolation",
            primaryMuscle: "rear delts",
            sets: [
              { reps: 15, weight: 0, rpe: 7 },
              { reps: 12, weight: 0, rpe: 8 },
              { reps: 10, weight: 0, rpe: 8 }
            ],
            restTime: 60,
            notes: "Pull to face level, squeeze shoulder blades"
          },
          {
            name: "Barbell Curls",
            type: "isolation",
            primaryMuscle: "biceps",
            sets: [
              { reps: 12, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 9 }
            ],
            restTime: 90,
            notes: "Controlled eccentric, no swinging"
          },
          {
            name: "Hammer Curls",
            type: "isolation",
            primaryMuscle: "biceps",
            sets: [
              { reps: 12, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 8 }
            ],
            restTime: 60,
            notes: "Neutral grip, focus on brachialis"
          }
        ]
      },
      [WorkoutType.LOWER_2_HAMSTRING_GLUTE]: {
        name: "Lower 2 - Hamstring/Glute Focus",
        description: "Hamstrings, Glutes, Posterior Chain",
        estimatedDuration: 90,
        targetMuscleGroups: ["hamstrings", "glutes", "posterior chain"],
        exercises: [
          {
            name: "Romanian Deadlifts",
            type: "compound",
            primaryMuscle: "hamstrings",
            sets: [
              { reps: 10, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 9 },
              { reps: 6, weight: 0, rpe: 9 }
            ],
            restTime: 180,
            notes: "Hip hinge, feel stretch in hamstrings"
          },
          {
            name: "Hip Thrusts",
            type: "compound",
            primaryMuscle: "glutes",
            sets: [
              { reps: 12, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 9 }
            ],
            restTime: 120,
            notes: "Full glute contraction at top, controlled descent"
          },
          {
            name: "Good Mornings",
            type: "compound",
            primaryMuscle: "hamstrings",
            sets: [
              { reps: 12, weight: 0, rpe: 7 },
              { reps: 10, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 8 }
            ],
            restTime: 90,
            notes: "Light weight, focus on hamstring stretch"
          },
          {
            name: "Lying Leg Curls",
            type: "isolation",
            primaryMuscle: "hamstrings",
            sets: [
              { reps: 15, weight: 0, rpe: 7 },
              { reps: 12, weight: 0, rpe: 8 },
              { reps: 10, weight: 0, rpe: 9 }
            ],
            restTime: 90,
            notes: "Full range of motion, squeeze at top"
          },
          {
            name: "Single Leg RDLs",
            type: "unilateral",
            primaryMuscle: "hamstrings",
            sets: [
              { reps: 10, weight: 0, rpe: 7 },
              { reps: 8, weight: 0, rpe: 8 },
              { reps: 8, weight: 0, rpe: 8 }
            ],
            restTime: 90,
            notes: "Each leg, balance and stability focus"
          },
          {
            name: "Glute Ham Raises",
            type: "compound",
            primaryMuscle: "hamstrings",
            sets: [
              { reps: 8, weight: 0, rpe: 7 },
              { reps: 6, weight: 0, rpe: 8 },
              { reps: 5, weight: 0, rpe: 9 }
            ],
            restTime: 120,
            notes: "Assisted if needed, focus on hamstring engagement"
          }
        ]
      },
      [WorkoutType.HIIT_CARDIO]: {
        name: "HIIT Cardio Session",
        description: "High-Intensity Interval Training",
        estimatedDuration: 30,
        targetMuscleGroups: ["cardiovascular", "full body"],
        exercises: [
          {
            name: "Burpees",
            type: "cardio",
            primaryMuscle: "full body",
            sets: [
              { reps: 30, weight: 0, rpe: 8 }
            ],
            restTime: 30,
            notes: "30 seconds work, 30 seconds rest"
          },
          {
            name: "Mountain Climbers",
            type: "cardio", 
            primaryMuscle: "core",
            sets: [
              { reps: 30, weight: 0, rpe: 8 }
            ],
            restTime: 30,
            notes: "30 seconds work, 30 seconds rest"
          },
          {
            name: "Jump Squats",
            type: "cardio",
            primaryMuscle: "legs",
            sets: [
              { reps: 30, weight: 0, rpe: 8 }
            ],
            restTime: 30,
            notes: "30 seconds work, 30 seconds rest"
          },
          {
            name: "High Knees",
            type: "cardio",
            primaryMuscle: "legs",
            sets: [
              { reps: 30, weight: 0, rpe: 8 }
            ],
            restTime: 30,
            notes: "30 seconds work, 30 seconds rest"
          },
          {
            name: "Plank Jacks",
            type: "cardio",
            primaryMuscle: "core",
            sets: [
              { reps: 30, weight: 0, rpe: 8 }
            ],
            restTime: 30,
            notes: "30 seconds work, 30 seconds rest"
          }
        ]
      },
      [WorkoutType.MOBILITY_RECOVERY]: {
        name: "Mobility & Recovery",
        description: "Flexibility and Recovery Session",
        estimatedDuration: 60,
        targetMuscleGroups: ["full body mobility"],
        exercises: [
          {
            name: "Cat-Cow Stretches",
            type: "mobility",
            primaryMuscle: "spine",
            sets: [
              { reps: 15, weight: 0, rpe: 3 }
            ],
            restTime: 0,
            notes: "Slow and controlled spinal movement"
          },
          {
            name: "Hip Circles",
            type: "mobility",
            primaryMuscle: "hips",
            sets: [
              { reps: 10, weight: 0, rpe: 3 }
            ],
            restTime: 0,
            notes: "Both directions, large range of motion"
          },
          {
            name: "Shoulder Rolls",
            type: "mobility",
            primaryMuscle: "shoulders",
            sets: [
              { reps: 10, weight: 0, rpe: 3 }
            ],
            restTime: 0,
            notes: "Both directions, focus on scapular movement"
          },
          {
            name: "Deep Squat Hold",
            type: "mobility",
            primaryMuscle: "hips",
            sets: [
              { reps: 60, weight: 0, rpe: 4 }
            ],
            restTime: 30,
            notes: "Hold for 60 seconds, work on ankle mobility"
          },
          {
            name: "Pigeon Pose",
            type: "mobility",
            primaryMuscle: "hips",
            sets: [
              { reps: 60, weight: 0, rpe: 4 }
            ],
            restTime: 0,
            notes: "Each side, 60 seconds hold"
          },
          {
            name: "Thoracic Extension",
            type: "mobility",
            primaryMuscle: "spine",
            sets: [
              { reps: 10, weight: 0, rpe: 3 }
            ],
            restTime: 0,
            notes: "Foam roller or over bench"
          }
        ]
      }
    }

    // If specific type requested, return that template
    if (type && workoutTemplates[type]) {
      return createSuccessResponse({
        type,
        template: workoutTemplates[type]
      })
    }

    // Return all templates
    return createSuccessResponse({
      templates: workoutTemplates,
      workoutTypes: Object.keys(workoutTemplates),
      description: "4-day workout split optimized for strength and muscle development"
    })

  } catch (error) {
    console.error('Get workout templates error:', error)
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