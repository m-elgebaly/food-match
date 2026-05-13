'use client'

import { useEffect, useState } from 'react'

interface SessionTimerProps {
  startedAt: string
  timeLimitSeconds: number
  onExpired?: () => void
}

export default function SessionTimer({ startedAt, timeLimitSeconds, onExpired }: SessionTimerProps) {
  const [remaining, setRemaining] = useState(timeLimitSeconds)

  useEffect(() => {
    const end = new Date(startedAt).getTime() + timeLimitSeconds * 1000

    const tick = () => {
      const now = Date.now()
      const left = Math.max(0, Math.round((end - now) / 1000))
      setRemaining(left)
      if (left === 0) onExpired?.()
    }

    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startedAt, timeLimitSeconds, onExpired])

  const pct = Math.max(0, (remaining / timeLimitSeconds) * 100)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  const color = remaining > timeLimitSeconds * 0.5
    ? 'bg-green-500'
    : remaining > timeLimitSeconds * 0.25
    ? 'bg-yellow-500'
    : 'bg-red-500'

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-medium text-stone-600">Time Remaining</span>
        <span className={`font-bold tabular-nums ${remaining < 30 ? 'text-red-600 animate-pulse' : 'text-stone-800'}`}>
          {mins}:{String(secs).padStart(2, '0')}
        </span>
      </div>
      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
