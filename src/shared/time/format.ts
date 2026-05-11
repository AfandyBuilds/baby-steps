/**
 * Format a past timestamp as "Xh Ym ago" / "just now" / etc.
 * Picks the most useful unit for the magnitude.
 */
export function formatTimeAgo(then: number, now: number = Date.now()): string {
  const diffMs = Math.max(0, now - then)
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return 'just now'

  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`

  const hr = Math.floor(min / 60)
  if (hr < 24) {
    const remMin = min - hr * 60
    return remMin === 0 ? `${hr}h ago` : `${hr}h ${remMin}m ago`
  }

  const day = Math.floor(hr / 24)
  if (day === 1) return 'yesterday'
  if (day < 7) return `${day}d ago`

  return new Date(then).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * "Today" / "Yesterday" / "May 8" — group header for time-grouped lists.
 */
export function formatDayLabel(date: Date, now: Date = new Date()): string {
  const days = Math.round((startOfDay(now.getTime()) - startOfDay(date.getTime())) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** "14:32" — 24-hour to avoid AM/PM clutter on history rows. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Local start-of-day (midnight) for a given timestamp. */
export function startOfDay(timestamp: number = Date.now()): number {
  const d = new Date(timestamp)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
