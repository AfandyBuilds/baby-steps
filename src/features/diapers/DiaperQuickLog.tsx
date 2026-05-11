import { useCurrentBaby } from '../../app/BabyContext'
import { Diapers, type DiaperType } from '../../shared/db'
import { formatTimeAgo } from '../../shared/time/format'
import { useDiaperStatsForToday } from './useDiapersForBaby'

interface Option {
  type: DiaperType
  label: string
  tone: string
}

// Subtle tinted backgrounds so each option is recognisable at a glance
// without yanking the eye away from the warm palette.
const options: Option[] = [
  {
    type: 'wet',
    label: 'Wet',
    tone: 'bg-sky-100 hover:bg-sky-200 text-sky-800 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-200',
  },
  {
    type: 'dirty',
    label: 'Dirty',
    tone: 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:hover:bg-amber-900 dark:text-amber-200',
  },
  {
    type: 'both',
    label: 'Both',
    tone: 'bg-stone-200 hover:bg-stone-300 text-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 dark:text-stone-200',
  },
]

const labelByType: Record<DiaperType, string> = {
  wet: 'Wet',
  dirty: 'Dirty',
  both: 'Both',
}

export function DiaperQuickLog() {
  const baby = useCurrentBaby()
  const stats = useDiaperStatsForToday(baby.id)

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="font-medium">Diapers</h2>
        <span className="text-xs text-muted-foreground">
          {stats ? `Today · ${stats.todayCount}` : ' '}
        </span>
      </header>

      <div className="grid grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.type}
            type="button"
            onClick={() => {
              void Diapers.createDiaper({
                babyId: baby.id,
                occurredAt: Date.now(),
                type: opt.type,
              })
            }}
            className={`py-4 rounded-xl font-medium text-sm transition active:scale-95 ${opt.tone}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Last:{' '}
        {stats?.last
          ? `${labelByType[stats.last.type]} · ${formatTimeAgo(stats.last.occurredAt)}`
          : 'none yet'}
      </p>
    </article>
  )
}
