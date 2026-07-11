import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/card'
// Toggle: mockAISummary (null → placeholder) or mockAISummaryPopulated
import { mockAISummaryPopulated as summary } from '@/lib/mock-data'

/**
 * AI Daily Brief card.
 * Server component. Replace mock import with Gemini API call in Phase 3.
 *
 * null summary → shows a placeholder invitation to connect Gmail.
 * string summary → renders Gemini's generated brief.
 */
export function AIDailySummary() {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
          <Sparkles size={13} className="text-foreground" aria-hidden />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground">Daemon AI</p>
            <span className="rounded-full border border-border px-1.5 py-px text-[10px] text-muted-foreground">
              Daily Brief
            </span>
          </div>

          {summary ? (
            <p className="text-sm leading-relaxed text-foreground">{summary}</p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connect Gmail and run your first scan. Daemon will generate a
              personalised morning brief here — deadlines, upcoming interviews,
              and what to do first.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
