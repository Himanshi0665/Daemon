'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function AIDailySummaryClient() {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ai/summary')
      .then(res => res.json())
      .then(data => {
        setSummary(data.summary)
        setLoading(false)
      })
      .catch(() => {
        setSummary("Failed to generate AI summary.")
        setLoading(false)
      })
  }, [])

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
          <Sparkles size={13} className="text-foreground" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground">Daemon AI</p>
            <span className="rounded-full border border-border px-1.5 py-px text-[10px] text-muted-foreground">
              Daily Brief
            </span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              Generating morning brief...
            </div>
          ) : summary ? (
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{summary}</p>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Connect Gmail and run your first scan. Daemon will generate a
              personalised morning brief here.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
