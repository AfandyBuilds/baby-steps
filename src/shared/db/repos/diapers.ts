import { db } from '../db'
import { createMeta, now } from '../meta'
import type { DiaperEntry, DiaperType } from '../types'

export interface CreateDiaperInput {
  babyId: string
  occurredAt: number
  type: DiaperType
  notes?: string
}

export async function createDiaper(input: CreateDiaperInput): Promise<DiaperEntry> {
  const record: DiaperEntry = {
    ...createMeta(),
    babyId: input.babyId,
    occurredAt: input.occurredAt,
    type: input.type,
    notes: input.notes,
  }
  await db.diapers.add(record)
  return record
}

export async function getDiaper(id: string): Promise<DiaperEntry | undefined> {
  return db.diapers.get(id)
}

export async function listDiapersForBaby(babyId: string): Promise<DiaperEntry[]> {
  return db.diapers.where('[babyId+deletedAt]').equals([babyId, 0]).toArray()
}

export async function listDiapersBetween(
  babyId: string,
  fromMs: number,
  toMs: number,
): Promise<DiaperEntry[]> {
  return db.diapers
    .where('[babyId+occurredAt]')
    .between([babyId, fromMs], [babyId, toMs], true, false)
    .filter((d) => d.deletedAt === 0)
    .toArray()
}

export async function updateDiaper(
  id: string,
  patch: Partial<Pick<DiaperEntry, 'occurredAt' | 'type' | 'notes'>>,
): Promise<DiaperEntry> {
  const existing = await db.diapers.get(id)
  if (!existing) throw new Error(`Diaper ${id} not found`)
  const updated: DiaperEntry = { ...existing, ...patch, updatedAt: now() }
  await db.diapers.put(updated)
  return updated
}

export async function softDeleteDiaper(id: string): Promise<void> {
  const existing = await db.diapers.get(id)
  if (!existing) return
  const t = now()
  await db.diapers.put({ ...existing, deletedAt: t, updatedAt: t })
}
