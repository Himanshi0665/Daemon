import { currentUser } from '@clerk/nextjs/server'
import { Bell } from 'lucide-react'

export async function Topbar() {
  const user = await currentUser()
  const greeting = user?.firstName ? `Good morning, ${user.firstName}` : 'Good morning'

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background">
      <p className="text-sm text-muted-foreground">{greeting}</p>

      <div className="flex items-center gap-2">
        {/* Notification bell — wired in Phase 4 */}
        <button className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
