import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  directPrisma: PrismaClient | undefined
}

// Create main Prisma client (using pooled connection)
const createMainClient = () => new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Create direct Prisma client (bypassing pooler)
const createDirectClient = () => {
  if (!process.env.DIRECT_URL) {
    throw new Error('DIRECT_URL not configured')
  }
  
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DIRECT_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Main Prisma client (using DATABASE_URL)
export const prisma = globalForPrisma.prisma ?? createMainClient()

// Direct Prisma client (using DIRECT_URL as fallback)
export const directPrisma = globalForPrisma.directPrisma ?? (() => {
  try {
    return createDirectClient()
  } catch {
    // If DIRECT_URL not available, use main client
    return prisma
  }
})()

// Database operation wrapper with automatic fallback
export async function withDatabaseFallback<T>(
  operation: (client: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    // Try main client first
    return await operation(prisma)
  } catch (error) {
    console.warn('🔄 Primary database connection failed, trying direct connection...')
    
    try {
      // Fallback to direct client
      return await operation(directPrisma)
    } catch (fallbackError) {
      console.error('❌ Both database connections failed')
      console.error('Primary error:', error)
      console.error('Fallback error:', fallbackError)
      throw fallbackError
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.directPrisma = directPrisma
}