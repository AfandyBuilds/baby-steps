import { useState } from 'react'
import { useCurrentBaby } from '../../app/BabyContext'
import { Feeds, type FeedEntry } from '../../shared/db'
import { formatDuration, formatTimeAgo } from '../../shared/time/format'
import { BottleForm } from './BottleForm'
import { BreastRunning } from './BreastRunning'
import { SolidForm } from './SolidForm'
import { useFeedDashboard } from './useFeedDashboard'

type FormMode = 'none' | 'bottle' | 'solid'
type Side = 'L' | 'R'

function lastFeedLine(feed: FeedEntry | undefined): string {
  if (!feed) return 'Last: none yet'
  switch (feed.type) {
    case 'bottle':
      return `Last: ${feed.amountMl} ml · ${formatTimeAgo(feed.startedAt)}`
    case 'breast': {
      const total = feed.leftDurationMs + feed.rightDurationMs
      return `Last: breast ${formatDuration(total)} · ${formatTimeAgo(feed.startedAt)}`
    }
    case 'solid':
      return `Last: ${feed.food} · ${formatTimeAgo(feed.startedAt)}`
  }
}

export function FeedQuickLog() {
  const baby = useCurrentBaby()
  const dash = useFeedDashboard(baby.id)
  const [formMode, setFormMode] = useState<FormMode>('none')

  const runningBreast = dash?.runningBreast
  // Recommend the opposite of her last completed breast feed.
  const nextSide: Side = dash?.lastBreastSide === 'L' ? 'R' : 'L'

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="font-medium">Feeds</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {dash
            ? `Today · ${dash.todayCount}${dash.todayBottleMl > 0 ? ` · ${dash.todayBottleMl} ml` : ''}`
            : ' '}
        </span>
      </header>

      {runningBreast ? (
        <BreastRunning feed={runningBreast} />
      ) : formMode === 'bottle' ? (
        <BottleForm
          defaultAmount={dash?.lastBottle?.amountMl ?? 120}
          defaultContents={dash?.lastBottle?.contents ?? 'formula'}
          onClose={() => setFormMode('none')}
        />
      ) : formMode === 'solid' ? (
        <SolidForm recentFoods={dash?.recentFoods ?? []} onClose={() => setFormMode('none')} />
      ) : (
        <>
          <button
            type="button"
            onClick={() => setFormMode('bottle')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
          >
            + Log bottle
          </button>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Breast{dash?.lastBreastSide ? ` · next: ${nextSide}` : ''}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['L', 'R'] as const).map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => {
                    void Feeds.createBreastFeed({
                      babyId: baby.id,
                      startedAt: Date.now(),
                      lastSide: side,
                    })
                  }}
                  className={`py-3 rounded-xl border text-sm font-medium bg-background hover:border-muted-foreground transition ${
                    dash?.lastBreastSide && nextSide === side
                      ? 'border-primary text-primary'
                      : 'border-border text-foreground'
                  }`}
                >
                  Start {side}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormMode('solid')}
            className="w-full py-3 rounded-xl border border-border bg-background text-sm font-medium hover:border-muted-foreground transition"
          >
            + Log solid food
          </button>

          <p className="text-xs text-muted-foreground">{lastFeedLine(dash?.lastFeed)}</p>
        </>
      )}
    </article>
  )
}
