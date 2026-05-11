import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import * as Babies from './repos/babies'
import * as Feeds from './repos/feeds'
import * as Sleeps from './repos/sleeps'
import * as Diapers from './repos/diapers'

beforeEach(async () => {
  await Promise.all([db.babies.clear(), db.feeds.clear(), db.sleeps.clear(), db.diapers.clear()])
})

async function seedBaby() {
  const baby = await Babies.createBaby({
    name: 'Layla',
    birthDate: '2025-12-10',
  })
  return baby.id
}

describe('Babies', () => {
  it('creates and retrieves a baby with default meta', async () => {
    const baby = await Babies.createBaby({
      name: 'Layla',
      birthDate: '2025-12-10',
    })
    expect(baby.name).toBe('Layla')
    expect(baby.deletedAt).toBe(0)
    expect(baby.createdAt).toBe(baby.updatedAt)

    const fetched = await Babies.getBaby(baby.id)
    expect(fetched?.id).toBe(baby.id)
  })

  it('lists only active babies', async () => {
    const a = await Babies.createBaby({ name: 'A', birthDate: '2025-01-01' })
    const b = await Babies.createBaby({ name: 'B', birthDate: '2025-01-01' })
    await Babies.softDeleteBaby(a.id)

    const active = await Babies.listActiveBabies()
    expect(active.map((x) => x.id)).toEqual([b.id])
  })

  it('updateBaby applies the patch and bumps updatedAt', async () => {
    const baby = await Babies.createBaby({
      name: 'Layla',
      birthDate: '2025-12-10',
    })
    const before = baby.updatedAt
    // Force a measurable tick.
    await new Promise((r) => setTimeout(r, 2))
    const updated = await Babies.updateBaby(baby.id, { name: 'Laila' })
    expect(updated.name).toBe('Laila')
    expect(updated.updatedAt).toBeGreaterThan(before)
  })

  it('getCurrentBaby returns the first active baby', async () => {
    expect(await Babies.getCurrentBaby()).toBeUndefined()
    const a = await Babies.createBaby({ name: 'A', birthDate: '2025-01-01' })
    const current = await Babies.getCurrentBaby()
    expect(current?.id).toBe(a.id)
  })
})

describe('Feeds', () => {
  let babyId: string
  beforeEach(async () => {
    babyId = await seedBaby()
  })

  it('creates a breast feed', async () => {
    const feed = await Feeds.createBreastFeed({
      babyId,
      startedAt: 1_000,
      leftDurationMs: 5 * 60_000,
      rightDurationMs: 7 * 60_000,
      lastSide: 'R',
    })
    expect(feed.type).toBe('breast')
    if (feed.type === 'breast') {
      expect(feed.leftDurationMs).toBe(5 * 60_000)
      expect(feed.rightDurationMs).toBe(7 * 60_000)
      expect(feed.lastSide).toBe('R')
    }
  })

  it('creates a bottle feed', async () => {
    const feed = await Feeds.createBottleFeed({
      babyId,
      startedAt: 1_000,
      amountMl: 120,
      contents: 'formula',
    })
    expect(feed.type).toBe('bottle')
    if (feed.type === 'bottle') {
      expect(feed.amountMl).toBe(120)
      expect(feed.contents).toBe('formula')
    }
  })

  it('creates a solid feed with first-try flag', async () => {
    const feed = await Feeds.createSolidFeed({
      babyId,
      startedAt: 1_000,
      food: 'avocado',
      isFirstTry: true,
      reactionNotes: 'liked it',
    })
    expect(feed.type).toBe('solid')
    if (feed.type === 'solid') {
      expect(feed.food).toBe('avocado')
      expect(feed.isFirstTry).toBe(true)
      expect(feed.reactionNotes).toBe('liked it')
    }
  })

  it('lists feeds for a baby and excludes soft-deleted', async () => {
    const a = await Feeds.createBottleFeed({
      babyId,
      startedAt: 1_000,
      amountMl: 100,
      contents: 'formula',
    })
    const b = await Feeds.createBottleFeed({
      babyId,
      startedAt: 2_000,
      amountMl: 100,
      contents: 'formula',
    })
    await Feeds.softDeleteFeed(a.id)

    const list = await Feeds.listFeedsForBaby(babyId)
    expect(list.map((f) => f.id)).toEqual([b.id])
  })

  it('range-queries feeds within a time window', async () => {
    await Feeds.createBottleFeed({
      babyId,
      startedAt: 500,
      amountMl: 100,
      contents: 'formula',
    })
    const middle = await Feeds.createBottleFeed({
      babyId,
      startedAt: 1_500,
      amountMl: 100,
      contents: 'formula',
    })
    await Feeds.createBottleFeed({
      babyId,
      startedAt: 2_500,
      amountMl: 100,
      contents: 'formula',
    })

    const inWindow = await Feeds.listFeedsBetween(babyId, 1_000, 2_000)
    expect(inWindow.map((f) => f.id)).toEqual([middle.id])
  })

  it('finds a running feed (endedAt === null)', async () => {
    await Feeds.createBottleFeed({
      babyId,
      startedAt: 1_000,
      endedAt: 2_000,
      amountMl: 100,
      contents: 'formula',
    })
    const running = await Feeds.createBreastFeed({
      babyId,
      startedAt: 3_000,
      endedAt: null,
    })

    const found = await Feeds.getRunningFeed(babyId)
    expect(found?.id).toBe(running.id)
  })

  it('endFeed sets endedAt and bumps updatedAt', async () => {
    const feed = await Feeds.createBreastFeed({ babyId, startedAt: 1_000 })
    const before = feed.updatedAt
    await new Promise((r) => setTimeout(r, 2))
    const ended = await Feeds.endFeed(feed.id, 4_000)
    expect(ended.endedAt).toBe(4_000)
    expect(ended.updatedAt).toBeGreaterThan(before)
  })
})

describe('Sleeps', () => {
  let babyId: string
  beforeEach(async () => {
    babyId = await seedBaby()
  })

  it('creates a running sleep and finds it via getRunningSleep', async () => {
    const sleep = await Sleeps.createSleep({ babyId, startedAt: 1_000 })
    expect(sleep.endedAt).toBeNull()
    const running = await Sleeps.getRunningSleep(babyId)
    expect(running?.id).toBe(sleep.id)
  })

  it('endSleep sets endedAt', async () => {
    const sleep = await Sleeps.createSleep({ babyId, startedAt: 1_000 })
    const ended = await Sleeps.endSleep(sleep.id, 3_000)
    expect(ended.endedAt).toBe(3_000)
  })

  it('completed sleeps are not returned by getRunningSleep', async () => {
    const sleep = await Sleeps.createSleep({ babyId, startedAt: 1_000 })
    await Sleeps.endSleep(sleep.id, 2_000)
    const running = await Sleeps.getRunningSleep(babyId)
    expect(running).toBeUndefined()
  })
})

describe('Diapers', () => {
  let babyId: string
  beforeEach(async () => {
    babyId = await seedBaby()
  })

  it('creates and retrieves a diaper', async () => {
    const d = await Diapers.createDiaper({
      babyId,
      occurredAt: 1_000,
      type: 'wet',
    })
    const got = await Diapers.getDiaper(d.id)
    expect(got?.type).toBe('wet')
  })

  it('lists diapers for a baby and excludes soft-deleted', async () => {
    const a = await Diapers.createDiaper({
      babyId,
      occurredAt: 1_000,
      type: 'wet',
    })
    const b = await Diapers.createDiaper({
      babyId,
      occurredAt: 2_000,
      type: 'dirty',
    })
    await Diapers.softDeleteDiaper(a.id)
    const list = await Diapers.listDiapersForBaby(babyId)
    expect(list.map((x) => x.id)).toEqual([b.id])
  })
})
