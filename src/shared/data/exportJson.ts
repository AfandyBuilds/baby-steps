import { db } from '../db'

/**
 * Exports the full local database as a JSON file the user can save.
 * Includes a `schemaVersion` so a future import flow knows what shape
 * the data is in.
 */
export async function exportJson(): Promise<void> {
  const [babies, feeds, sleeps, diapers] = await Promise.all([
    db.babies.toArray(),
    db.feeds.toArray(),
    db.sleeps.toArray(),
    db.diapers.toArray(),
  ])

  const payload = {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    babies,
    feeds,
    sleeps,
    diapers,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `baby-steps-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
