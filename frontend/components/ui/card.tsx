import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * default   — white bg, 1px border (most common)
   * flat      — muted bg, no border (subtle sections)
   * elevated  — white bg, border + shadow (hero cards)
   */
  variant?: 'default' | 'flat' | 'elevated'
}

const variantClasses = {
  default: 'bg-card text-card-foreground border border-border',
  flat: 'bg-muted/50 text-card-foreground',
  elevated: 'bg-card text-card-foreground border border-border shadow-sm',
}

/**
 * Base container for all dashboard sections.
 * Server component — no state or event handlers.
 */
export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-lg', variantClasses[variant], className)}
      {...props}
    />
  )
}
