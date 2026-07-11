import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { getCategoryMeta, type ItemCategory } from '@/lib/categories'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        outline: 'border border-border text-foreground',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/** Generic badge for status labels, counts, tags. */
export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

/** Specialised badge that automatically colours itself by ItemCategory. */
export function CategoryBadge({ category }: { category: ItemCategory }) {
  const meta = getCategoryMeta(category)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
        meta.textClass,
      )}
    >
      {meta.shortLabel}
    </span>
  )
}
