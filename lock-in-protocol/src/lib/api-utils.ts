import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Create Supabase server client for API routes
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieStore.set({ name, value, ...options })
        },
        remove: (name: string, options: Record<string, unknown>) => {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Authentication middleware for API routes
export async function authenticateUser() {
  try {
    // Temporary bypass for development
    if (process.env.NODE_ENV === 'development') {
      return { 
        user: { 
          id: 'dev-user-123', 
          email: 'chiranjeet@example.com',
          name: 'Chiranjeet'
        }, 
        error: null 
      }
    }
    
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null, error: 'Unauthorized' }
    }
    
    return { user, error: null }
  } catch {
    return { user: null, error: 'Authentication failed' }
  }
}

// Error response helpers
export function createErrorResponse(
  message: string, 
  status = 500
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { 
      success: false, 
      error: message 
    }, 
    { status }
  )
}

export function createSuccessResponse<T>(
  data: T, 
  message?: string,
  status = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { 
      success: true, 
      data, 
      message 
    }, 
    { status }
  )
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  message?: string
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages
    },
    message
  })
}

// Validation helper
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      return { data: null, error: `Validation error: ${errorMessages}` }
    }
    return { data: null, error: 'Invalid request body' }
  }
}

// Query parameter helpers
export function getQueryParams(url: string) {
  const { searchParams } = new URL(url)
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100), // Max 100 items
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    search: searchParams.get('search') || '',
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : null,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : null,
  }
}

// Date helpers for API
export function getDateRange(date?: string | Date) {
  const targetDate = date ? new Date(date) : new Date()
  const startOfDay = new Date(targetDate)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(targetDate)
  endOfDay.setHours(23, 59, 59, 999)
  
  return { startOfDay, endOfDay }
}

export function getWeekRange(date?: string | Date) {
  const targetDate = date ? new Date(date) : new Date()
  const startOfWeek = new Date(targetDate)
  startOfWeek.setDate(targetDate.getDate() - targetDate.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)
  
  return { startOfWeek, endOfWeek }
}

// Handle different HTTP methods
export function methodNotAllowed(allowedMethods: string[]) {
  return NextResponse.json(
    { 
      success: false, 
      error: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}` 
    },
    { 
      status: 405,
      headers: {
        'Allow': allowedMethods.join(', ')
      }
    }
  )
}

// Rate limiting helper (basic implementation)
const rateLimitMap = new Map()

export function rateLimit(identifier: string, maxRequests = 100, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitMap.has(identifier)) {
    rateLimitMap.set(identifier, [])
  }
  
  const requests = rateLimitMap.get(identifier)
  
  // Remove old requests outside the window
  const validRequests = requests.filter((time: number) => time > windowStart)
  rateLimitMap.set(identifier, validRequests)
  
  if (validRequests.length >= maxRequests) {
    return false
  }
  
  validRequests.push(now)
  return true
}

// CORS headers for API routes
export function addCORSHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Handle OPTIONS requests
export function handleOptions() {
  const response = new NextResponse(null, { status: 200 })
  return addCORSHeaders(response)
}

// Common error types
export const API_ERRORS = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
  RATE_LIMITED: 'Too many requests',
  CONFLICT: 'Resource conflict',
} as const