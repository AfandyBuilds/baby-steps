import Dexie, { type EntityTable } from 'dexie'
import type { BabyRecord, DiaperEntry, FeedEntry, SleepEntry } from './types'

/**
 * IndexedDB schema for baby-steps.
 *
 * The schema string declares which fields are indexed. The first field
 * is the primary key. Compound indexes use [a+b] syntax.
 *
 * Conventions:
 *   - Every record has `deletedAt` (0 = active). We index it so soft-delete
 *     filters happen at the index, not in memory.
 *   - Per-baby queries use compound indexes like `[babyId+deletedAt]`.
 *   - Time-range queries use compound indexes like `[babyId+startedAt]`.
 */
class BabyStepsDB extends Dexie {
  babies!: EntityTable<BabyRecord, 'id'>
  feeds!: EntityTable<FeedEntry, 'id'>
  sleeps!: EntityTable<SleepEntry, 'id'>
  diapers!: EntityTable<DiaperEntry, 'id'>

  constructor() {
    super('baby-steps')
    this.version(1).stores({
      babies: 'id, name, deletedAt',
      feeds:
        'id, babyId, type, startedAt, endedAt, deletedAt, [babyId+startedAt], [babyId+deletedAt]',
      sleeps: 'id, babyId, startedAt, endedAt, deletedAt, [babyId+startedAt], [babyId+deletedAt]',
      diapers: 'id, babyId, occurredAt, deletedAt, [babyId+occurredAt], [babyId+deletedAt]',
    })
  }
}

export const db = new BabyStepsDB()
