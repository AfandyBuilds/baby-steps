/**
 * Shared metadata on every record.
 *
 * `deletedAt: 0` means active. We use a 0 sentinel instead of `null`
 * because IndexedDB indexes do NOT include null values, which would force
 * us to load all rows into memory and filter — fine at a few thousand
 * records, but a needless cost. With 0 as sentinel, queries like
 * `where('[babyId+deletedAt]').equals([babyId, 0])` filter at the index.
 */
export interface Meta {
  id: string
  createdAt: number
  updatedAt: number
  deletedAt: number
}

export interface BabyOwned {
  babyId: string
}

// ---------- Baby ----------

export interface BabyRecord extends Meta {
  name: string
  /** ISO date string `YYYY-MM-DD` */
  birthDate: string
}

// ---------- Feed (discriminated union on `type`) ----------

interface FeedBase extends Meta, BabyOwned {
  startedAt: number
  /** `null` = still in progress (running timer) */
  endedAt: number | null
  notes?: string
}

export interface BreastFeedEntry extends FeedBase {
  type: 'breast'
  leftDurationMs: number
  rightDurationMs: number
  lastSide: 'L' | 'R' | null
}

export interface BottleFeedEntry extends FeedBase {
  type: 'bottle'
  amountMl: number
  contents: 'formula' | 'breastmilk'
}

export interface SolidFeedEntry extends FeedBase {
  type: 'solid'
  food: string
  isFirstTry: boolean
  reactionNotes?: string
}

export type FeedEntry = BreastFeedEntry | BottleFeedEntry | SolidFeedEntry
export type FeedType = FeedEntry['type']

// ---------- Sleep ----------

export interface SleepEntry extends Meta, BabyOwned {
  startedAt: number
  /** `null` = still sleeping (running timer) */
  endedAt: number | null
  notes?: string
}

// ---------- Diaper ----------

export type DiaperType = 'wet' | 'dirty' | 'both'

export interface DiaperEntry extends Meta, BabyOwned {
  occurredAt: number
  type: DiaperType
  notes?: string
}
