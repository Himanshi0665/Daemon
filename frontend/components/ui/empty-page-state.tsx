import type { LucideIcon } from 'lucide-react'

interface EmptyPageStateProps {
  icon: LucideIcon
  description: string
  phase?: string
}

/**
 * Shared empty state for stub pages.
 * Used by all pages not yet implemented.
 */
export function EmptyPageState({
  icon: Icon,
  description,
  phase,
}: EmptyPageStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center py-24">
      <Icon size={36} className="text-muted-foreground/30 mb-5" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
        {description}
      </p>
      {phase && (
        <span className="mt-5 text-xs text-muted-foreground/50 border border-border rounded-full px-3 py-1">
          {phase}
        </span>
      )}
    </div>
  )
}
