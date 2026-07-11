'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard,
  Inbox,
  CalendarClock,
  BarChart2,
  Sparkles,
  Activity,
  Bell,
  Settings,
  ListChecks,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * All hrefs map to a real page.tsx that exists in app/(app)/.
 *
 * Sidebar label   → route           → purpose
 * ─────────────────────────────────────────────────────
 * Dashboard       → /dashboard      → main view
 * Inbox           → /inbox          → inbox intelligence
 * Tasks           → /tasks          → tasks (new page, coming soon)
 * Calendar        → /calendar       → calendar (new page, coming soon)
 * Daemon AI       → /daemon-ai      → AI assistant
 * Analytics       → /analytics      → analytics
 * Timeline        → /timeline       → timeline
 * Activity        → /activity       → activity log
 * Notifications   → /notifications  → notification centre
 * Settings        → /settings       → settings
 */
const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/calendar', label: 'Calendar', icon: CalendarClock },
  { href: '/daemon-ai', label: 'Daemon AI', icon: Sparkles },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/timeline', label: 'Timeline', icon: CalendarClock },
]

const bottomNavItems = [
  { href: '/activity', label: 'Activity', icon: Activity },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex flex-col border-r border-border bg-background shrink-0"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border">
        <span className="font-semibold text-sm tracking-tight">Daemon</span>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" role="navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={<item.icon size={15} aria-hidden />}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="py-3 px-2 space-y-0.5 border-t border-border">
        {bottomNavItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={<item.icon size={15} aria-hidden />}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
          />
        ))}
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2.5">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-xs text-muted-foreground truncate">Account</span>
      </div>
    </aside>
  )
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
        active
          ? 'text-foreground bg-accent font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
      )}
    >
      {icon}
      {label}
    </Link>
  )
}

