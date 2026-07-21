import { Card } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import { EmptyState } from '@/components/ui/empty-state'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getTodaysFocus } from '@backend/repositories/item.repository'
import { CheckCircle2 } from 'lucide-react'

export async function TodaysFocus() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const user = await requireUserByClerkId(clerkId)
  const items = await getTodaysFocus(user.id)

  return (
    <Card className="p-4">
      <SectionTitle
        title="Today's Focus"
        className="mb-3"
      />
      
      {items.length === 0 ? (
        <EmptyState
          title="Nothing scheduled"
          description="No actionable items found in your recent emails."
          size="sm"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-3 rounded-md bg-secondary/30 p-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                {item.company && <p className="text-xs text-muted-foreground">{item.company}</p>}
                {item.actionRequired && <p className="mt-1 text-xs text-foreground/80">{item.actionRequired}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
