import { db } from '../db'
import { createMeta, now } from '../meta'
import type { BottleFeedEntry, BreastFeedEntry, FeedEntry, SolidFeedEntry } from '../types'

// ---------- Inputs ----------

export interface CreateBreastFeedInput {
  babyId: string
  startedAt: number
  endedAt?: number | null
  leftDurationMs?: number
  rightDurationMs?: number
  lastSide?: 'L' | 'R' | null
  notes?: string
}

export interface CreateBottleFeedInput {
  babyId: string
  startedAt: number
  endedAt?: number | null
  amountMl: number
  contents: 'formula' | 'breastmilk'
  notes?: string
}

export interface CreateSolidFeedInput {
  babyId: string
  startedAt: number
  endedAt?: number | null
  food: string
  isFirstTry?: boolean
  reactionNotes?: string
  notes?: string
}

// ---------- Creators (one per feed type — caller knows what they're making) ----------

export async function createBreastFeed(input: CreateBreastFeedInput): Promise<BreastFeedEntry> {
  const record: BreastFeedEntry = {
    ...createMeta(),
    type: 'breast',
    babyId: input.babyId,
    startedAt: input.startedAt,
    endedAt: input.endedAt ?? null,
    leftDurationMs: input.leftDurationMs ?? 0,
    rightDurationMs: input.rightDurationMs ?? 0,
    lastSide: input.lastSide ?? null,
    notes: input.notes,
  }
  await db.feeds.add(record)
  return record
}

export async function createBottleFeed(input: CreateBottleFeedInput): Promise<BottleFeedEntry> {
  const record: BottleFeedEntry = {
    ...createMeta(),
    type: 'bottle',
    babyId: input.babyId,
    startedAt: input.startedAt,
    endedAt: input.endedAt ?? null,
    amountMl: input.amountMl,
    contents: input.contents,
    notes: input.notes,
  }
  await db.feeds.add(record)
  return record
}

export async function createSolidFeed(input: CreateSolidFeedInput): Promise<SolidFeedEntry> {
  const record: SolidFeedEntry = {
    ...createMeta(),
    type: 'solid',
    babyId: input.babyId,
    startedAt: input.startedAt,
    endedAt: input.endedAt ?? null,
    food: input.food,
    isFirstTry: input.isFirstTry ?? false,
    reactionNotes: input.reactionNotes,
    notes: input.notes,
  }
  await db.feeds.add(record)
  return record
}

// ---------- Queries ----------

export async function getFeed(id: string): Promise<FeedEntry | undefined> {
  return db.feeds.get(id)
}

export async function listFeedsForBaby(babyId: string): Promise<FeedEntry[]> {
  return db.feeds.where('[babyId+deletedAt]').equals([babyId, 0]).toArray()
}

export async function listFeedsBetween(
  babyId: string,
  fromMs: number,
  toMs: number,
): Promise<FeedEntry[]> {
  // The compound index lets us scope to one baby + a time range in one query.
  // We still need an in-memory filter to drop soft-deleted rows because the
  // index used here is [babyId+startedAt], not [babyId+deletedAt].
  return db.feeds
    .where('[babyId+startedAt]')
    .between([babyId, fromMs], [babyId, toMs], true, false)
    .filter((f) => f.deletedAt === 0)
    .toArray()
}

/**
 * Returns the running feed (endedAt === null) for a baby, if any.
 * v1 assumption: at most one running feed at a time.
 */
export async function getRunningFeed(babyId: string): Promise<FeedEntry | undefined> {
  const candidates = await db.feeds.where('[babyId+deletedAt]').equals([babyId, 0]).toArray()
  return candidates.find((f) => f.endedAt === null)
}

// ---------- Mutations ----------

export async function endFeed(id: string, endedAt: number): Promise<FeedEntry> {
  const existing = await db.feeds.get(id)
  if (!existing) throw new Error(`Feed ${id} not found`)
  const updated = { ...existing, endedAt, updatedAt: now() }
  await db.feeds.put(updated)
  return updated
}

/**
 * Switches the active side on a running breast feed. The time spent on the
 * previous side since the last side-change (or since `startedAt` for the
 * first switch) is added to that side's cumulative duration, then `lastSide`
 * flips. The "currently active side" elapsed time is always derivable as
 * `now - startedAt - leftDurationMs - rightDurationMs`, so we don't need a
 * separate `sideStartedAt` field.
 */
export async function switchBreastSide(
  id: string,
  newSide: 'L' | 'R',
  switchedAt: number,
): Promise<BreastFeedEntry> {
  const existing = await db.feeds.get(id)
  if (!existing) throw new Error(`Feed ${id} not found`)
  if (existing.type !== 'breast') {
    throw new Error(`Feed ${id} is not a breast feed`)
  }
  if (existing.endedAt !== null) {
    throw new Error(`Breast feed ${id} is already ended`)
  }
  const onCurrent = Math.max(
    0,
    switchedAt - existing.startedAt - existing.leftDurationMs - existing.rightDurationMs,
  )
  const updated: BreastFeedEntry = {
    ...existing,
    leftDurationMs:
      existing.lastSide === 'L' ? existing.leftDurationMs + onCurrent : existing.leftDurationMs,
    rightDurationMs:
      existing.lastSide === 'R' ? existing.rightDurationMs + onCurrent : existing.rightDurationMs,
    lastSide: newSide,
    updatedAt: switchedAt,
  }
  await db.feeds.put(updated)
  return updated
}

/**
 * Ends a running breast feed. The currently-active side's accumulated time
 * is folded into its cumulative duration, then `endedAt` is set.
 */
export async function endBreastFeed(id: string, endedAt: number): Promise<BreastFeedEntry> {
  const existing = await db.feeds.get(id)
  if (!existing) throw new Error(`Feed ${id} not found`)
  if (existing.type !== 'breast') {
    throw new Error(`Feed ${id} is not a breast feed`)
  }
  if (existing.endedAt !== null) {
    throw new Error(`Breast feed ${id} is already ended`)
  }
  const onCurrent = Math.max(
    0,
    endedAt - existing.startedAt - existing.leftDurationMs - existing.rightDurationMs,
  )
  const updated: BreastFeedEntry = {
    ...existing,
    leftDurationMs:
      existing.lastSide === 'L' ? existing.leftDurationMs + onCurrent : existing.leftDurationMs,
    rightDurationMs:
      existing.lastSide === 'R' ? existing.rightDurationMs + onCurrent : existing.rightDurationMs,
    endedAt,
    updatedAt: endedAt,
  }
  await db.feeds.put(updated)
  return updated
}

export async function softDeleteFeed(id: string): Promise<void> {
  const existing = await db.feeds.get(id)
  if (!existing) return
  const t = now()
  await db.feeds.put({ ...existing, deletedAt: t, updatedAt: t })
}
