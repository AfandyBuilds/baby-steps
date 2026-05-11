import { useLiveQuery } from 'dexie-react-hooks'
import { Sleeps, type SleepEntry } from '../../shared/db'
import { startOfDay } from '../../shared/time/format'

/**
 * Reactive list of all active sleeps for a baby, newest first.
 */
export function useSleepForBaby(babyId: string): SleepEntry[] | undefined {
  return useLiveQuery(async () => {
    const list = await Sleeps.listSleepsForBaby(babyId)
    return list.sort((a, b) => b.startedAt - a.startedAt)
  }, [babyId])
}

export interface SleepDashboard {
  running: SleepEntry | undefined
  /** Sum of completed naps that overlap today, clipped to today. */
  todayCompletedMs: number
  lastCompleted: SleepEntry | undefined
}

/**
 * Compact home-screen view: running sleep + today's completed total +
 * the most recent completed nap (for the "Last ended Xh ago" line).
 *
 * The running portion of today's total is added in the component, not here,
 * because it ticks every second and we don't want to re-run the DB query
 * 60 times per minute.
 */
export function useSleepDashboard(babyId: string): SleepDashboard | undefined {
  return useLiveQuery(async () => {
    const list = await Sleeps.listSleepsForBaby(babyId)
    list.sort((a, b) => b.startedAt - a.startedAt)

    const running = list.find((s) => s.endedAt === null)
    const todayStart = startOfDay()

    let todayCompletedMs = 0
    for (const s of list) {
      if (s.endedAt === null) continue
      if (s.endedAt < todayStart) continue
      const start = Math.max(s.startedAt, todayStart)
      todayCompletedMs += Math.max(0, s.endedAt - start)
    }

    const lastCompleted = list.find((s) => s.endedAt !== null)

    return { running, todayCompletedMs, lastCompleted }
  }, [babyId])
}
