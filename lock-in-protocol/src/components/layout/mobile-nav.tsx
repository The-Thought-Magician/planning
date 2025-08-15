'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  if (!isOpen) {return null}

  return (
    <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-col auto-cols-max md:hidden">
      <ScrollArea className="relative z-20 w-full bg-background px-6 pb-8 shadow-md">
        <div className="grid gap-6 p-4">
          <nav className="grid gap-2">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex w-full items-center rounded-md p-3 text-sm font-medium transition-colors hover:bg-accent',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Quick Stats */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold">Today&apos;s Progress</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Schedule Adherence</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Workout Complete</span>
                <span className="text-sm font-medium text-green-600">✓ Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deep Work Hours</span>
                <span className="text-sm font-medium">4.2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pomodoro Sessions</span>
                <span className="text-sm font-medium">8 sessions</span>
              </div>
            </div>
          </div>

          {/* Mobile Streaks */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold">Current Streaks</h3>
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lock-In Protocol</span>
                <span className="text-sm font-medium">12 days 🔥</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Workout Consistency</span>
                <span className="text-sm font-medium">6 days 💪</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Early Rise</span>
                <span className="text-sm font-medium">5 days 🌅</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className="relative z-10 bg-background/80 backdrop-blur-sm" onClick={onClose} />
    </div>
  )
}