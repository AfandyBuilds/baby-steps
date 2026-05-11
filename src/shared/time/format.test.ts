import { describe, expect, it } from 'vitest'
import { formatDayLabel, formatDuration, formatTime, formatTimeAgo, startOfDay } from './format'

describe('formatTimeAgo', () => {
  const now = 1_700_000_000_000

  it('returns "just now" for under a minute', () => {
    expect(formatTimeAgo(now - 30_000, now)).toBe('just now')
  })

  it('returns minutes only when under an hour', () => {
    expect(formatTimeAgo(now - 15 * 60_000, now)).toBe('15m ago')
  })

  it('returns hours only when minute remainder is zero', () => {
    expect(formatTimeAgo(now - 2 * 3_600_000, now)).toBe('2h ago')
  })

  it('returns hours + minutes when both present', () => {
    expect(formatTimeAgo(now - (2 * 60 + 14) * 60_000, now)).toBe('2h 14m ago')
  })

  it('returns "yesterday" at ~1 day', () => {
    expect(formatTimeAgo(now - 26 * 3_600_000, now)).toBe('yesterday')
  })

  it('returns day count for 2–6 days', () => {
    expect(formatTimeAgo(now - 3 * 86_400_000, now)).toBe('3d ago')
  })
})

describe('formatDayLabel', () => {
  it('labels today', () => {
    const now = new Date('2026-05-11T15:00:00')
    expect(formatDayLabel(new Date('2026-05-11T03:00:00'), now)).toBe('Today')
  })

  it('labels yesterday', () => {
    const now = new Date('2026-05-11T15:00:00')
    expect(formatDayLabel(new Date('2026-05-10T22:00:00'), now)).toBe('Yesterday')
  })

  it('labels older days as month + day', () => {
    const now = new Date('2026-05-11T15:00:00')
    const label = formatDayLabel(new Date('2026-05-08T10:00:00'), now)
    expect(label).toMatch(/May\s*8/)
  })
})

describe('formatTime', () => {
  it('formats as 24-hour HH:MM', () => {
    const d = new Date('2026-05-11T14:32:00')
    expect(formatTime(d)).toMatch(/^14:32$/)
  })
})

describe('formatDuration', () => {
  it('formats sub-minute as seconds only', () => {
    expect(formatDuration(45 * 1000)).toBe('45s')
  })

  it('formats minutes + seconds', () => {
    expect(formatDuration((3 * 60 + 14) * 1000)).toBe('3m 14s')
  })

  it('drops seconds when zero', () => {
    expect(formatDuration(5 * 60 * 1000)).toBe('5m')
  })

  it('formats hours + minutes', () => {
    expect(formatDuration((2 * 3600 + 17 * 60) * 1000)).toBe('2h 17m')
  })

  it('drops minutes when zero', () => {
    expect(formatDuration(2 * 3600 * 1000)).toBe('2h')
  })

  it('treats negative input as zero', () => {
    expect(formatDuration(-100)).toBe('0s')
  })
})

describe('startOfDay', () => {
  it('truncates to local midnight', () => {
    const t = new Date('2026-05-11T14:32:45').getTime()
    const sod = startOfDay(t)
    const date = new Date(sod)
    expect(date.getHours()).toBe(0)
    expect(date.getMinutes()).toBe(0)
    expect(date.getSeconds()).toBe(0)
  })
})
