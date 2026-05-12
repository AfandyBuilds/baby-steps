import { Feeds, type BreastFeedEntry } from '../../shared/db'
import { formatDuration } from '../../shared/time/format'
import { useElapsed } from '../../shared/time/useElapsed'

type Side = 'L' | 'R'

interface SideStatProps {
  side: Side
  durationMs: number
  active: boolean
}

function SideStat({ side, durationMs, active }: SideStatProps) {
  return (
    <div
      className={`rounded-xl p-3 text-center border transition ${
        active ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
        <span className={active ? 'text-primary' : 'text-muted-foreground'}>{side}</span>
        {active && (
          <span
            aria-label="active side"
            className="inline-block w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
      </p>
      <p className="text-2xl font-light tabular-nums mt-1">{formatDuration(durationMs)}</p>
    </div>
  )
}

export function BreastRunning({ feed }: { feed: BreastFeedEntry }) {
  // Total elapsed since the feed started; ticks once per second.
  const elapsedSinceStart = useElapsed(feed.startedAt)

  // Time on the currently active side, derived from the invariant
  // L + R + onCurrentSide == elapsedSinceStart.
  const onCurrentSide = Math.max(0, elapsedSinceStart - feed.leftDurationMs - feed.rightDurationMs)
  const leftDisplay = feed.leftDurationMs + (feed.lastSide === 'L' ? onCurrentSide : 0)
  const rightDisplay = feed.rightDurationMs + (feed.lastSide === 'R' ? onCurrentSide : 0)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <SideStat side="L" durationMs={leftDisplay} active={feed.lastSide === 'L'} />
        <SideStat side="R" durationMs={rightDisplay} active={feed.lastSide === 'R'} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            const newSide: Side = feed.lastSide === 'L' ? 'R' : 'L'
            void Feeds.switchBreastSide(feed.id, newSide, Date.now())
          }}
          className="py-3 rounded-xl border border-border bg-background text-foreground hover:border-muted-foreground transition"
        >
          Switch sides
        </button>
        <button
          type="button"
          onClick={() => {
            void Feeds.endBreastFeed(feed.id, Date.now())
          }}
          className="py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
        >
          End feed
        </button>
      </div>
    </div>
  )
}
