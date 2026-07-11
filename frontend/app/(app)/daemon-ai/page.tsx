import { Sparkles } from 'lucide-react'
import { EmptyPageState } from '@/components/ui/empty-page-state'

export default function DaemonAIPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Daemon AI</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ask questions. Get answers grounded in your actual inbox.
        </p>
      </div>
      <EmptyPageState
        icon={Sparkles}
        description="Ask Daemon what you should do today, which deadlines are coming up, or to summarize a recruiter thread. Powered by Gemini."
        phase="Available in Phase 5"
      />
    </div>
  )
}
