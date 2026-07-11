import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateAction {
  label: string
  href: string
  variant?: 'default' | 'outline'
}

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction
  className?: string
  /** Controls the vertical padding and icon size. */
  size?: 'sm' | 'default' | 'lg'
}

const sizeConfig = {
  sm: { padding: 'py-8', iconSize: 28, titleClass: 'text-sm', descClass: 'text-xs' },
  default: { padding: 'py-14', iconSize: 36, titleClass: 'text-sm', descClass: 'text-sm' },
  lg: { padding: 'py-24', iconSize: 44, titleClass: 'text-base', descClass: 'text-sm' },
} as const

/**
 * Reusable empty state for dashboard sections and full pages.
 * Server component — no hooks.
 *
 * For interactive actions (onClick), wrap in a client component.
 * For navigation, pass action.href.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  size = 'default',
}: EmptyStateProps) {
  const { padding, iconSize, titleClass, descClass } = sizeConfig[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        padding,
        className,
      )}
    >
      {Icon && (
        <Icon
          size={iconSize}
          className="text-muted-foreground/25 mb-4"
          strokeWidth={1.5}
          aria-hidden
        />
      )}

      <p className={cn('font-medium text-foreground', titleClass)}>{title}</p>

      {description && (
        <p
          className={cn(
            'text-muted-foreground mt-1 max-w-[260px] leading-relaxed',
            descClass,
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <Link
          href={action.href}
          className={cn(
            'mt-5 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            action.variant === 'outline'
              ? 'border border-border text-foreground hover:bg-accent'
              : 'bg-primary text-primary-foreground hover:bg-primary/90',
          )}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
