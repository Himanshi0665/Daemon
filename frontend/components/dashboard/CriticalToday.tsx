import { CheckCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getCriticalToday } from '@backend/repositories/item.repository'

export async function CriticalToday() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const user = await requireUserByClerkId(clerkId)
  const items = await getCriticalToday(user.id)

  return (
    <Card className="px-5 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Critical Today
      </p>
      
      {items.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="You're clear"
          description="No critical deadlines detected in your inbox."
          size="sm"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="flex items-start gap-3 rounded-md bg-destructive/10 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">{item.title}</p>
                {item.company && <p className="text-xs text-destructive/80">{item.company}</p>}
                {item.actionRequired && <p className="mt-1 text-xs text-destructive/90">{item.actionRequired}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
