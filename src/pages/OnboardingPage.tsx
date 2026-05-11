import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router'
import { Babies } from '../shared/db'

export function OnboardingPage() {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !birthDate) return
    setSubmitting(true)
    await Babies.createBaby({ name: trimmed, birthDate })
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-medium">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            Tell us about your little one to get started.
          </p>
        </header>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Baby&rsquo;s name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Layla"
            required
            autoFocus
            className="px-4 py-3 rounded-xl border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium">Birth date</span>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            max={new Date().toISOString().slice(0, 10)}
            className="px-4 py-3 rounded-xl border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-sm hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Get started'}
        </button>
      </form>
    </main>
  )
}
