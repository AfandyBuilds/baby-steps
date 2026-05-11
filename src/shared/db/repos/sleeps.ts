import { db } from '../db'
import { createMeta, now } from '../meta'
import type { SleepEntry } from '../types'

export interface CreateSleepInput {
  babyId: string
  startedAt: number
  endedAt?: number | null
  notes?: string
}

export async function createSleep(input: CreateSleepInput): Promise<SleepEntry> {
  const record: SleepEntry = {
    ...createMeta(),
    babyId: input.babyId,
    startedAt: input.startedAt,
    endedAt: input.endedAt ?? null,
    notes: input.notes,
  }
  await db.sleeps.add(record)
  return record
}

export async function getSleep(id: string): Promise<SleepEntry | undefined> {
  return db.sleeps.get(id)
}

export async function listSleepsForBaby(babyId: string): Promise<SleepEntry[]> {
  return db.sleeps.where('[babyId+deletedAt]').equals([babyId, 0]).toArray()
}

export async function listSleepsBetween(
  babyId: string,
  fromMs: number,
  toMs: number,
): Promise<SleepEntry[]> {
  return db.sleeps
    .where('[babyId+startedAt]')
    .between([babyId, fromMs], [babyId, toMs], true, false)
    .filter((s) => s.deletedAt === 0)
    .toArray()
}

/**
 * Returns the running sleep (endedAt === null) for a baby, if any.
 * v1 assumption: at most one running sleep at a time.
 */
export async function getRunningSleep(babyId: string): Promise<SleepEntry | undefined> {
  const candidates = await db.sleeps.where('[babyId+deletedAt]').equals([babyId, 0]).toArray()
  return candidates.find((s) => s.endedAt === null)
}

export async function endSleep(id: string, endedAt: number): Promise<SleepEntry> {
  const existing = await db.sleeps.get(id)
  if (!existing) throw new Error(`Sleep ${id} not found`)
  const updated = { ...existing, endedAt, updatedAt: now() }
  await db.sleeps.put(updated)
  return updated
}

export async function softDeleteSleep(id: string): Promise<void> {
  const existing = await db.sleeps.get(id)
  if (!existing) return
  const t = now()
  await db.sleeps.put({ ...existing, deletedAt: t, updatedAt: t })
}
