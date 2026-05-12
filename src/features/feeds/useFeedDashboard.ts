import { useLiveQuery } from 'dexie-react-hooks'
import { Feeds, type BottleFeedEntry, type FeedEntry } from '../../shared/db'
import { startOfDay } from '../../shared/time/format'

export interface FeedDashboard {
  /** All feed types today (count). */
  todayCount: number
  /** Sum of bottle ml today. Zero when no bottles. */
  todayBottleMl: number
  /** Most recent feed of any type. */
  lastFeed: FeedEntry | undefined
  /** Most recent bottle, used to default the bottle form. */
  lastBottle: BottleFeedEntry | undefined
}

/**
 * Home-screen view for feeds. Single query, derived stats.
 *
 * Bottle ml is a per-type aggregate; sleep duration and solids reactions will
 * follow the same "compute the type-specific stat in this hook" pattern.
 */
export function useFeedDashboard(babyId: string): FeedDashboard | undefined {
  return useLiveQuery(async () => {
    const all = await Feeds.listFeedsForBaby(babyId)
    all.sort((a, b) => b.startedAt - a.startedAt)

    const todayStart = startOfDay()
    const today = all.filter((f) => f.startedAt >= todayStart)

    let todayBottleMl = 0
    for (const f of today) {
      if (f.type === 'bottle') todayBottleMl += f.amountMl
    }

    const lastFeed = all[0]
    const lastBottle = all.find((f): f is BottleFeedEntry => f.type === 'bottle')

    return { todayCount: today.length, todayBottleMl, lastFeed, lastBottle }
  }, [babyId])
}
