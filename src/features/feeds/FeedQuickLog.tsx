import { type FormEvent, useState } from 'react'
import { useCurrentBaby } from '../../app/BabyContext'
import { Feeds, type FeedEntry } from '../../shared/db'
import { formatDuration, formatTimeAgo } from '../../shared/time/format'
import { BreastRunning } from './BreastRunning'
import { useFeedDashboard } from './useFeedDashboard'

type Contents = 'formula' | 'breastmilk'
type Side = 'L' | 'R'

function lastFeedLine(feed: FeedEntry | undefined): string {
  if (!feed) return 'Last: none yet'
  if (feed.type === 'bottle') {
    return `Last: ${feed.amountMl} ml · ${formatTimeAgo(feed.startedAt)}`
  }
  if (feed.type === 'breast') {
    const total = feed.leftDurationMs + feed.rightDurationMs
    return `Last: breast ${formatDuration(total)} · ${formatTimeAgo(feed.startedAt)}`
  }
  return `Last: feed · ${formatTimeAgo(feed.startedAt)}`
}

export function FeedQuickLog() {
  const baby = useCurrentBaby()
  const dash = useFeedDashboard(baby.id)
  const [isBottleFormOpen, setIsBottleFormOpen] = useState(false)
  const [amount, setAmount] = useState<string>('120')
  const [contents, setContents] = useState<Contents>('formula')

  function openBottleForm() {
    setAmount(String(dash?.lastBottle?.amountMl ?? 120))
    setContents(dash?.lastBottle?.contents ?? 'formula')
    setIsBottleFormOpen(true)
  }

  function submitBottle(e: FormEvent) {
    e.preventDefault()
    const ml = parseInt(amount, 10)
    if (!Number.isFinite(ml) || ml <= 0) return
    const t = Date.now()
    void Feeds.createBottleFeed({
      babyId: baby.id,
      startedAt: t,
      endedAt: t,
      amountMl: ml,
      contents,
    })
    setIsBottleFormOpen(false)
  }

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
      ) : isBottleFormOpen ? (
        <form onSubmit={submitBottle} className="space-y-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Amount (ml)</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
              className="px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(['formula', 'breastmilk'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setContents(c)}
                className={`py-2 rounded-xl border text-sm font-medium transition ${
                  contents === c
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:border-muted-foreground'
                }`}
              >
                {c === 'formula' ? 'Formula' : 'Breastmilk'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsBottleFormOpen(false)}
              className="py-3 rounded-xl border border-border bg-background text-foreground hover:border-muted-foreground transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={openBottleForm}
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

          <p className="text-xs text-muted-foreground">{lastFeedLine(dash?.lastFeed)}</p>
        </>
      )}
    </article>
  )
}
