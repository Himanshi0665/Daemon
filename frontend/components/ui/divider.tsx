import { cn } from '@/lib/utils'

interface DividerProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional centred label (e.g. "This Week"). */
  label?: string
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Thin separator line.
 * Horizontal by default. Use orientation="vertical" for column dividers.
 * Server component.
 */
export function Divider({
  label,
  orientation = 'horizontal',
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('h-full w-px bg-border', className)}
        {...props}
      />
    )
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn('flex items-center gap-3', className)}
        {...props}
      >
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    )
  }

  return (
    <hr
      role="separator"
      className={cn('h-px border-0 bg-border', className)}
      {...props}
    />
  )
}
