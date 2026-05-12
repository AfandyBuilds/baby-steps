import { useLiveQuery } from 'dexie-react-hooks'
import { Feeds, type FeedEntry } from '../../shared/db'

/** Reactive list of all active feeds for a baby, newest first. */
export function useFeedsForBaby(babyId: string): FeedEntry[] | undefined {
  return useLiveQuery(async () => {
    const list = await Feeds.listFeedsForBaby(babyId)
    return list.sort((a, b) => b.startedAt - a.startedAt)
  }, [babyId])
}
