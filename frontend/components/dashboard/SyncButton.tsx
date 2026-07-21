'use client'

import { useState } from 'react'
import { RefreshCw, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SyncState = 'idle' | 'syncing' | 'success' | 'error'

/**
 * "Sync Now" button with loading/success/error states.
 * Client component — used inside the DaemonStatusPanel.
 */
export function SyncButton() {
  const [state, setState] = useState<SyncState>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleSync() {
    setState('syncing')
    setMessage('Syncing...')

    try {
      let hasMore = true
      let totalSynced = 0
      
      while (hasMore) {
        const res = await fetch('/api/gmail/sync', { method: 'POST' })
        const data = await res.json()

        if (!res.ok) {
          setState('error')
          setMessage(data.error ?? 'Sync failed')
          return
        }

        totalSynced += data.synced || 0
        hasMore = data.hasMore
        
        if (hasMore) {
          setMessage(`Syncing... (${totalSynced} emails so far)`)
        }
      }

      setState('success')
      setMessage(`Synced ${totalSynced} emails`)

      // Reset to idle after 3 seconds so the user can sync again
      setTimeout(() => {
        setState('idle')
        setMessage(null)
        // Reload to update all server components with fresh DB data
        window.location.reload()
      }, 2000)

    } catch {
      setState('error')
      setMessage('Network error. Please try again.')
    }
  }

  const icon = {
    idle: <RefreshCw size={13} />,
    syncing: <RefreshCw size={13} className="animate-spin" />,
    success: <Check size={13} />,
    error: <AlertCircle size={13} />,
  }[state]

  const label = {
    idle: 'Sync Now',
    syncing: 'Syncing…',
    success: message ?? 'Done',
    error: message ?? 'Failed',
  }[state]

  return (
    <Button
      size="sm"
      variant={state === 'error' ? 'destructive' : 'outline'}
      onClick={handleSync}
      disabled={state === 'syncing'}
      aria-label="Sync Gmail emails"
    >
      {icon}
      <span className="ml-1.5">{label}</span>
    </Button>
  )
}
