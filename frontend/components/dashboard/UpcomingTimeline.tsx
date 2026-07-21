import { CalendarDays, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SectionTitle } from '@/components/ui/section-title'
import { EmptyState } from '@/components/ui/empty-state'
import { auth } from '@clerk/nextjs/server'
import { requireUserByClerkId } from '@backend/utils/auth'
import { getUpcomingItems } from '@backend/repositories/item.repository'

export async function UpcomingTimeline() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const user = await requireUserByClerkId(clerkId)
  const items = await getUpcomingItems(user.id)

  return (
    <Card className="p-4">
      <SectionTitle title="Upcoming" className="mb-3" />
      {items.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No upcoming events"
          description="AI will extract interviews, deadlines, and meetings from your emails."
          size="sm"
        />
      ) : (
        <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {items.map(item => (
            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-background bg-muted-foreground/20 text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                <Clock className="w-3 h-3" />
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-secondary/50 p-3 rounded shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.deadline?.toLocaleDateString()}
                  </span>
                </div>
                {item.company && <div className="text-xs text-muted-foreground">{item.company}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
