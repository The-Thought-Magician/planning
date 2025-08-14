'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // For development, bypass auth if using demo Supabase setup
  const isDevelopment = process.env.NODE_ENV === 'development' && 
                       process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('demo')

  useEffect(() => {
    if (!isDevelopment && !loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router, isDevelopment])

  if (!isDevelopment && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isDevelopment && !user) {
    return null
  }

  return <>{children}</>
}