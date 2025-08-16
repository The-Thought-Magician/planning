import { PrismaClient } from '@prisma/client'

type DatabaseOperation<T> = (prisma: PrismaClient) => Promise<T>

interface DatabaseConfig {
  maxRetries: number
  retryDelay: number
  connectionTimeout: number
}

const defaultConfig: DatabaseConfig = {
  maxRetries: 2,
  retryDelay: 1000,
  connectionTimeout: 5000
}

// Create clients for both connection methods
let primaryClient: PrismaClient | null = null
let fallbackClient: PrismaClient | null = null

function createPrimaryClient(): PrismaClient {
  if (!primaryClient && process.env.DATABASE_URL) {
    primaryClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return primaryClient!
}

function createFallbackClient(): PrismaClient {
  if (!fallbackClient && process.env.DIRECT_URL) {
    fallbackClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DIRECT_URL
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return fallbackClient!
}

// Test if a database connection is working
async function testConnection(client: PrismaClient, timeout: number = 5000): Promise<boolean> {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), timeout)
    )
    
    await Promise.race([
      client.$queryRaw`SELECT 1`,
      timeoutPromise
    ])
    
    return true
  } catch (error) {
    console.warn('Database connection test failed:', error)
    return false
  }
}

// Execute database operation with automatic fallback
export async function withDatabaseFallback<T>(
  operation: DatabaseOperation<T>,
  config: Partial<DatabaseConfig> = {}
): Promise<T> {
  const { maxRetries, retryDelay, connectionTimeout } = { ...defaultConfig, ...config }
  let lastError: Error | null = null

  // Try primary connection first (pooled)
  if (process.env.DATABASE_URL) {
    try {
      const client = createPrimaryClient()
      
      // Test connection
      const isConnected = await testConnection(client, connectionTimeout)
      if (isConnected) {
        console.log('✅ Using DATABASE_URL (pooled connection)')
        return await operation(client)
      } else {
        console.warn('⚠️ Primary database connection (DATABASE_URL) failed connection test')
      }
    } catch (error) {
      console.warn('⚠️ Primary database operation failed:', error)
      lastError = error as Error
    }
  }

  // Fallback to direct connection
  if (process.env.DIRECT_URL) {
    try {
      const client = createFallbackClient()
      
      // Test connection
      const isConnected = await testConnection(client, connectionTimeout)
      if (isConnected) {
        console.log('✅ Using DIRECT_URL (direct connection) as fallback')
        return await operation(client)
      } else {
        console.error('❌ Fallback database connection (DIRECT_URL) also failed connection test')
      }
    } catch (error) {
      console.error('❌ Fallback database operation failed:', error)
      lastError = error as Error
    }
  }

  // If both connections fail, throw the last error
  throw new Error(`Database connection failed: ${lastError?.message || 'Unknown error'}`)
}

// Wrapper function that uses the current working connection approach
export async function executeWithDatabase<T>(operation: DatabaseOperation<T>): Promise<T> {
  // For now, use the direct URL approach that we know works
  if (process.env.DIRECT_URL) {
    const client = createFallbackClient()
    return await operation(client)
  } else if (process.env.DATABASE_URL) {
    const client = createPrimaryClient()
    return await operation(client)
  } else {
    throw new Error('No database URL configured')
  }
}

// Cleanup function
export async function disconnectDatabase(): Promise<void> {
  if (primaryClient) {
    await primaryClient.$disconnect()
    primaryClient = null
  }
  if (fallbackClient) {
    await fallbackClient.$disconnect()
    fallbackClient = null
  }
}