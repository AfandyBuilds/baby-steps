import { useLiveQuery } from 'dexie-react-hooks'
import {
  Feeds,
  type BottleFeedEntry,
  type BreastFeedEntry,
  type FeedEntry,
  type SolidFeedEntry,
} from '../../shared/db'
import { startOfDay } from '../../shared/time/format'

export interface FeedDashboard {
  /** All feed types today (count). */
  todayCount: number
  /** Sum of bottle ml today. Zero when no bottles. */
  todayBottleMl: number
  /** Most recent feed of any type. */
  lastFeed: FeedEntry | undefined
  /** Most recent bottle — used to default the bottle form. */
  lastBottle: BottleFeedEntry | undefined
  /** A running breast feed (endedAt === null), if any. */
  runningBreast: BreastFeedEntry | undefined
  /** Last completed breast feed's `lastSide` — drives the "next side" hint. */
  lastBreastSide: 'L' | 'R' | null
  /** Up to 5 distinct food names from recent solid feeds, newest unique first. */
  recentFoods: string[]
}

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
    const runningBreast = all.find(
      (f): f is BreastFeedEntry => f.type === 'breast' && f.endedAt === null,
    )
    const lastCompletedBreast = all.find(
      (f): f is BreastFeedEntry => f.type === 'breast' && f.endedAt !== null,
    )
    const lastBreastSide = lastCompletedBreast?.lastSide ?? null

    // Distinct recent foods. Lowercase key for dedup, preserve original casing
    // in the displayed chip.
    const recentFoods: string[] = []
    const seen = new Set<string>()
    for (const f of all) {
      if (f.type !== 'solid') continue
      const solid = f as SolidFeedEntry
      const name = solid.food.trim()
      const key = name.toLowerCase()
      if (!name || seen.has(key)) continue
      recentFoods.push(name)
      seen.add(key)
      if (recentFoods.length >= 5) break
    }

    return {
      todayCount: today.length,
      todayBottleMl,
      lastFeed,
      lastBottle,
      runningBreast,
      lastBreastSide,
      recentFoods,
    }
  }, [babyId])
}
