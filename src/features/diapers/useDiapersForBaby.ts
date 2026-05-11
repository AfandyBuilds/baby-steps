import { useLiveQuery } from 'dexie-react-hooks'
import { Diapers, type DiaperEntry } from '../../shared/db'
import { startOfDay } from '../../shared/time/format'

/**
 * Reactive list of all active diapers for a baby, newest first.
 * `undefined` while the initial query is in flight.
 */
export function useDiapersForBaby(babyId: string): DiaperEntry[] | undefined {
  return useLiveQuery(async () => {
    const list = await Diapers.listDiapersForBaby(babyId)
    return list.sort((a, b) => b.occurredAt - a.occurredAt)
  }, [babyId])
}

export interface DiaperStats {
  last: DiaperEntry | undefined
  todayCount: number
}

/**
 * Compact stats for the home card: most recent diaper + today's count.
 * Derived from a single query to avoid double round-trips.
 */
export function useDiaperStatsForToday(babyId: string): DiaperStats | undefined {
  return useLiveQuery(async () => {
    const list = await Diapers.listDiapersForBaby(babyId)
    list.sort((a, b) => b.occurredAt - a.occurredAt)
    const todayStart = startOfDay()
    const todayCount = list.filter((d) => d.occurredAt >= todayStart).length
    return { last: list[0], todayCount }
  }, [babyId])
}
