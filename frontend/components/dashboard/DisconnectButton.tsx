'use client'

import { useState } from 'react'
import { Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * "Disconnect Gmail" button with confirmation and loading state.
 * Client component — used inside the DaemonStatusPanel.
 */
export function DisconnectButton() {
  const [state, setState] = useState<'idle' | 'confirming' | 'disconnecting'>('idle')

  async function handleDisconnect() {
    if (state === 'idle') {
      setState('confirming')
      // Auto-reset after 3 seconds if user doesn't confirm
      setTimeout(() => setState((s) => (s === 'confirming' ? 'idle' : s)), 3000)
      return
    }

    if (state === 'confirming') {
      setState('disconnecting')
      try {
        await fetch('/api/gmail/disconnect', { method: 'DELETE' })
        window.location.reload()
      } catch {
        setState('idle')
      }
    }
  }

  const label = {
    idle: 'Disconnect',
    confirming: 'Confirm?',
    disconnecting: 'Disconnecting…',
  }[state]

  return (
    <Button
      size="sm"
      variant={state === 'confirming' ? 'destructive' : 'ghost'}
      onClick={handleDisconnect}
      disabled={state === 'disconnecting'}
      aria-label="Disconnect Gmail"
    >
      <Unplug size={13} />
      <span className="ml-1.5">{label}</span>
    </Button>
  )
}
