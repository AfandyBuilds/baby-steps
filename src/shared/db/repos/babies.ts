import { db } from '../db'
import { createMeta, now } from '../meta'
import type { BabyRecord } from '../types'

export interface CreateBabyInput {
  name: string
  /** ISO date string `YYYY-MM-DD` */
  birthDate: string
}

export async function createBaby(input: CreateBabyInput): Promise<BabyRecord> {
  const record: BabyRecord = {
    ...createMeta(),
    name: input.name,
    birthDate: input.birthDate,
  }
  await db.babies.add(record)
  return record
}

export async function getBaby(id: string): Promise<BabyRecord | undefined> {
  return db.babies.get(id)
}

export async function listActiveBabies(): Promise<BabyRecord[]> {
  return db.babies.where('deletedAt').equals(0).toArray()
}

/**
 * v1 single-baby helper: returns the first active baby, or undefined.
 * The UI uses this on launch to choose between onboarding and home.
 */
export async function getCurrentBaby(): Promise<BabyRecord | undefined> {
  const list = await listActiveBabies()
  return list[0]
}

export async function updateBaby(
  id: string,
  patch: Partial<Pick<BabyRecord, 'name' | 'birthDate'>>,
): Promise<BabyRecord> {
  const existing = await db.babies.get(id)
  if (!existing) throw new Error(`Baby ${id} not found`)
  const updated: BabyRecord = { ...existing, ...patch, updatedAt: now() }
  await db.babies.put(updated)
  return updated
}

export async function softDeleteBaby(id: string): Promise<void> {
  const existing = await db.babies.get(id)
  if (!existing) return
  const t = now()
  await db.babies.put({ ...existing, deletedAt: t, updatedAt: t })
}
