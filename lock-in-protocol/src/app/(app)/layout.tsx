import React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { AuthGuard } from '@/components/auth/auth-guard'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  )
}