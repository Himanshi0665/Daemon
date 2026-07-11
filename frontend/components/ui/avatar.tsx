import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return (
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : name.slice(0, 2)
  ).toUpperCase()
}

const sizeClasses = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

/**
 * User avatar — shows image if available, falls back to initials.
 * Server component.
 */
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClass = sizeClasses[size]

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ? `${name}'s avatar` : 'User avatar'}
        className={cn('rounded-full object-cover bg-muted', sizeClass, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground select-none',
        sizeClass,
        className,
      )}
      aria-label={name ?? 'User'}
      role="img"
    >
      {getInitials(name)}
    </div>
  )
}
