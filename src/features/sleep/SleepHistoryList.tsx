import { useCurrentBaby } from '../../app/BabyContext'
import type { SleepEntry } from '../../shared/db'
import { formatDayLabel, formatDuration, formatTime } from '../../shared/time/format'
import { useSleepForBaby } from './useSleepForBaby'

interface DayGroup {
  key: string
  label: string
  entries: SleepEntry[]
}

function groupByDay(entries: SleepEntry[]): DayGroup[] {
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

export function SleepHistoryList() {
  const baby = useCurrentBaby()
  const entries = useSleepForBaby(baby.id)

  if (entries === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-1">
        <p className="text-sm font-medium">No sleep logged yet</p>
        <p className="text-xs text-muted-foreground">
          Start a nap or overnight from the Home tab.
        </p>
      </div>
    )
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
                <span className="text-sm font-medium tabular-nums">
                  {formatTime(new Date(e.startedAt))}
                  {e.endedAt !== null ? ` – ${formatTime(new Date(e.endedAt))}` : ' – running'}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {e.endedAt === null ? 'now' : formatDuration(e.endedAt - e.startedAt)}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
