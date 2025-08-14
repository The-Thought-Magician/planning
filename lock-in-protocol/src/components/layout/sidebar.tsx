'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAVIGATION_ITEMS } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
// (no ScrollArea used here)

type SidebarProps = React.HTMLAttributes<HTMLDivElement>

export function Sidebar({ className, ...props }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn('pb-12', className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Lock-In Protocol
          </h2>
          <div className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                {item.href === '/dashboard' && (
                  <Badge variant="secondary" className="ml-auto">
                    Live
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Quick Stats Section */}
        <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
            Today&apos;s Progress
          </h3>
          <div className="space-y-2 px-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Schedule</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Workout</span>
              <span className="font-medium text-green-600">✓</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deep Work</span>
              <span className="font-medium">4.2h</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pomodoros</span>
              <span className="font-medium">8</span>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="px-3 py-2">
          <h3 className="mb-2 px-4 text-sm font-semibold tracking-tight text-muted-foreground">
            Current Streaks
          </h3>
          <div className="space-y-2 px-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Lock-In Days</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                12 🔥
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Workout</span>
              <Badge variant="outline" className="text-red-600 border-red-600">
                6 💪
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}