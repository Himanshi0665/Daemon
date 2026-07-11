import { cn } from '@/lib/utils'

interface SectionTitleProps {
  title: string
  /** Appears right-aligned (count, last-updated time, etc.). */
  subtitle?: React.ReactNode
  className?: string
}

/**
 * Section heading used inside Cards.
 * Renders an <h2> for correct document hierarchy below PageHeader's <h1>.
 * Server component.
 */
export function SectionTitle({ title, subtitle, className }: SectionTitleProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {subtitle !== undefined && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
    </div>
  )
}
