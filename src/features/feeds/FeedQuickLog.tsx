import { type FormEvent, useState } from 'react'
import { useCurrentBaby } from '../../app/BabyContext'
import { Feeds, type FeedEntry } from '../../shared/db'
import { formatTimeAgo } from '../../shared/time/format'
import { useFeedDashboard } from './useFeedDashboard'

type Contents = 'formula' | 'breastmilk'

function lastFeedLine(feed: FeedEntry | undefined): string {
  if (!feed) return 'Last: none yet'
  if (feed.type === 'bottle') {
    return `Last: ${feed.amountMl} ml · ${formatTimeAgo(feed.startedAt)}`
  }
  // Breast / solid land in later milestones; keep a fallback for safety.
  return `Last: feed · ${formatTimeAgo(feed.startedAt)}`
}

export function FeedQuickLog() {
  const baby = useCurrentBaby()
  const dash = useFeedDashboard(baby.id)

  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState<string>('120')
  const [contents, setContents] = useState<Contents>('formula')

  function open() {
    // Pre-fill with her last bottle so a steady-pattern feed is one extra tap.
    setAmount(String(dash?.lastBottle?.amountMl ?? 120))
    setContents(dash?.lastBottle?.contents ?? 'formula')
    setIsOpen(true)
  }

  function handleSubmit(e: FormEvent) {
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
    setIsOpen(false)
  }

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

      {isOpen ? (
        <form onSubmit={handleSubmit} className="space-y-3">
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
              onClick={() => setIsOpen(false)}
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
            onClick={open}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
          >
            + Log bottle
          </button>
          <p className="text-xs text-muted-foreground">{lastFeedLine(dash?.lastFeed)}</p>
        </>
      )}
    </article>
  )
}
