import { useCurrentBaby } from '../../app/BabyContext'
import type { FeedEntry } from '../../shared/db'
import { formatDayLabel, formatDuration, formatTime } from '../../shared/time/format'
import { useFeedsForBaby } from './useFeedsForBaby'

interface DayGroup {
  key: string
  label: string
  entries: FeedEntry[]
}

function groupByDay(entries: FeedEntry[]): DayGroup[] {
  const groups = new Map<string, DayGroup>()
  for (const e of entries) {
    const d = new Date(e.startedAt)
    const key = d.toDateString()
    let group = groups.get(key)
    if (!group) {
      group = { key, label: formatDayLabel(d), entries: [] }
      groups.set(key, group)
    }
    group.entries.push(e)
  }
  return [...groups.values()]
}

/**
 * Format a single feed for the history row. The discriminated union on
 * `type` lets us pull per-type fields without runtime casts.
 *
 * Note: breast and solid are wired up here in advance so Milestones 6 and 7
 * only need to add the create UI — the history view already handles them.
 */
function feedLabel(feed: FeedEntry): string {
  switch (feed.type) {
    case 'bottle':
      return `Bottle · ${feed.amountMl} ml ${feed.contents === 'formula' ? 'formula' : 'breastmilk'}`
    case 'breast': {
      const total = feed.leftDurationMs + feed.rightDurationMs
      return total > 0 ? `Breast · ${formatDuration(total)}` : 'Breast'
    }
    case 'solid':
      return `Solid · ${feed.food}${feed.isFirstTry ? ' · first try' : ''}`
  }
}

export function FeedHistoryList() {
  const baby = useCurrentBaby()
  const entries = useFeedsForBaby(baby.id)

  if (entries === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No feeds logged yet.</p>
  }

  const groups = groupByDay(entries)

  return (
    <ul className="space-y-6">
      {groups.map((group) => (
        <li key={group.key} className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {group.label}
          </h3>
          <ul>
            {group.entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <span className="text-sm font-medium">{feedLabel(e)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(new Date(e.startedAt))}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
