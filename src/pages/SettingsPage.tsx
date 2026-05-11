import { type FormEvent, useState } from 'react'
import { useCurrentBaby } from '../app/BabyContext'
import { useTheme } from '../shared/theme/useTheme'
import type { ThemeMode } from '../shared/theme/ThemeContext'
import { Babies } from '../shared/db'
import { exportJson } from '../shared/data/exportJson'

const themeOptions: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function SettingsPage() {
  const baby = useCurrentBaby()
  const { mode, setMode } = useTheme()

  const [name, setName] = useState(baby.name)
  const [birthDate, setBirthDate] = useState(baby.birthDate)
  const [profileSaved, setProfileSaved] = useState(false)

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !birthDate) return
    await Babies.updateBaby(baby.id, { name: trimmed, birthDate })
    setProfileSaved(true)
    window.setTimeout(() => setProfileSaved(false), 2000)
  }

  return (
    <section className="space-y-10">
      <h1 className="text-2xl font-medium">Settings</h1>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Theme
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMode(opt.value)}
              className={`px-3 py-2 rounded-xl border text-sm font-medium transition ${
                mode === opt.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-surface text-foreground hover:border-muted-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-3" onSubmit={saveProfile}>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Baby
        </h2>
        <label className="flex flex-col gap-2">
          <span className="text-sm">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm">Birth date</span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
            className="px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            Save
          </button>
          {profileSaved && <span className="text-xs text-muted-foreground">Saved.</span>}
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Data
        </h2>
        <p className="text-sm text-muted-foreground">
          Data lives only on this device until cloud sync is added. Save a backup to your phone or
          cloud drive every week or two.
        </p>
        <button
          type="button"
          onClick={() => {
            void exportJson()
          }}
          className="px-4 py-2 rounded-xl border border-border bg-surface text-foreground hover:border-muted-foreground transition"
        >
          Export to JSON
        </button>
      </div>
    </section>
  )
}
