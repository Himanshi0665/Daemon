import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  /** Optional action buttons rendered in the top-right corner. */
  actions?: React.ReactNode
  className?: string
}

/**
 * Consistent page-level heading used on every (app) page.
 * Renders an <h1> for correct document outline and SEO.
 * Server component.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4', className)}
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  )
}
