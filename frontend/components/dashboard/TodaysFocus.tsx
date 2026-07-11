'use client'

import { useState } from 'react'
import { Square, CheckSquare, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import { CategoryBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import type { FocusItem } from '@/lib/mock-data'
// Toggle: mockTodaysFocus (empty) or mockTodaysFocusPopulated
import { mockTodaysFocusPopulated as initialItems } from '@/lib/mock-data'

/**
 * Interactive Today's Focus checklist.
 * Client component for checkbox toggle state.
 * In Phase 3, replace initialItems with SWR/fetch + optimistic updates.
 */
export function TodaysFocus() {
  const [items, setItems] = useState<FocusItem[]>(initialItems)

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item,
      ),
    )

  const doneCount = items.filter((i) => i.isDone).length

  return (
    <Card className="p-4">
      <SectionTitle
        title="Today's Focus"
        subtitle={`${doneCount} / ${items.length} done`}
        className="mb-3"
      />

      {items.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description="Connect Gmail and scan your inbox to build today's focus list."
          size="sm"
        />
      ) : (
        <ul className="space-y-0.5" role="list" aria-label="Today's focus items">
          {items.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => toggle(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left',
                  'transition-colors duration-100 hover:bg-accent',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
                aria-pressed={item.isDone}
                aria-label={`${item.isDone ? 'Unmark' : 'Mark'}: ${item.label}`}
              >
                {item.isDone ? (
                  <CheckSquare
                    size={14}
                    className="shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                ) : (
                  <Square
                    size={14}
                    className="shrink-0 text-foreground"
                    aria-hidden
                  />
                )}

                <span
                  className={cn(
                    'flex-1 truncate text-sm',
                    item.isDone
                      ? 'text-muted-foreground line-through'
                      : 'text-foreground',
                  )}
                >
                  {item.label}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  {item.time && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock size={10} aria-hidden />
                      {item.time}
                    </span>
                  )}
                  <CategoryBadge category={item.category} />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
