import { useCurrentBaby } from '../../app/BabyContext'
import type { DiaperEntry, DiaperType } from '../../shared/db'
import { formatDayLabel, formatTime } from '../../shared/time/format'
import { useDiapersForBaby } from './useDiapersForBaby'

const labelByType: Record<DiaperType, string> = {
  wet: 'Wet',
  dirty: 'Dirty',
  both: 'Both',
}

interface DayGroup {
  key: string
  label: string
  entries: DiaperEntry[]
}

function groupByDay(entries: DiaperEntry[]): DayGroup[] {
  const groups = new Map<string, DayGroup>()
  for (const e of entries) {
    const d = new Date(e.occurredAt)
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

export function DiaperHistoryList() {
  const baby = useCurrentBaby()
  const entries = useDiapersForBaby(baby.id)

  if (entries === undefined) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center space-y-1">
        <p className="text-sm font-medium">No diapers logged yet</p>
        <p className="text-xs text-muted-foreground">
          Tap Wet, Dirty, or Both on the Home tab to log a change.
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
                <span className="text-sm font-medium">{labelByType[e.type]}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {formatTime(new Date(e.occurredAt))}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
