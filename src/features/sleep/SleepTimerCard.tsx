import { useCurrentBaby } from '../../app/BabyContext'
import { Sleeps } from '../../shared/db'
import { formatDuration, formatTimeAgo } from '../../shared/time/format'
import { useElapsed } from '../../shared/time/useElapsed'
import { useSleepDashboard } from './useSleepForBaby'

export function SleepTimerCard() {
  const baby = useCurrentBaby()
  const dash = useSleepDashboard(baby.id)
  const running = dash?.running
  const runningElapsed = useElapsed(running?.startedAt ?? null)

  const totalTodayMs = (dash?.todayCompletedMs ?? 0) + runningElapsed

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="font-medium">Sleep</h2>
        <span className="text-xs text-muted-foreground">
          {dash ? `Today · ${formatDuration(totalTodayMs)}` : ' '}
        </span>
      </header>

      {running ? (
        <div className="space-y-3 text-center">
          <p className="text-5xl font-light tabular-nums">{formatDuration(runningElapsed)}</p>
          <p className="text-xs text-muted-foreground">
            Sleeping since {formatTimeAgo(running.startedAt)}
          </p>
          <button
            type="button"
            onClick={() => {
              void Sleeps.endSleep(running.id, Date.now())
            }}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
          >
            Wake up
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              void Sleeps.createSleep({
                babyId: baby.id,
                startedAt: Date.now(),
              })
            }}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
          >
            Start sleep
          </button>
          <p className="text-xs text-muted-foreground text-center">
            {dash?.lastCompleted?.endedAt
              ? `Last ended ${formatTimeAgo(dash.lastCompleted.endedAt)}`
              : 'No sleeps yet'}
          </p>
        </>
      )}
    </article>
  )
}
