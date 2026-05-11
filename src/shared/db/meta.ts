import type { Meta } from './types'

export function newId(): string {
  return crypto.randomUUID()
}

export function now(): number {
  return Date.now()
}

export function createMeta(): Meta {
  const t = now()
  return {
    id: newId(),
    createdAt: t,
    updatedAt: t,
    deletedAt: 0,
  }
}

export function bumpUpdatedAt(): Pick<Meta, 'updatedAt'> {
  return { updatedAt: now() }
}
