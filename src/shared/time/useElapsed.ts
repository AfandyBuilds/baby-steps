import { useEffect, useState } from 'react'

/**
 * Returns ms elapsed since `startedAt`, ticking once per second.
 * Returns 0 when `startedAt` is null (no active timer).
 *
 * Purely display: the source of truth for the start time is the DB record.
 * This hook just refreshes the rendered string so the running counter moves.
 *
 * Implementation note: `now` is stored in state so the render function stays
 * pure. The lazy initializer captures the time once at mount; the interval
 * callback (an event source, not the effect body) updates it on each tick.
 */
export function useElapsed(startedAt: number | null): number {
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    if (startedAt === null) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [startedAt])

  return startedAt === null ? 0 : Math.max(0, now - startedAt)
}
