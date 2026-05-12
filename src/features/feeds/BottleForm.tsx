import { type FormEvent, useState } from 'react'
import { useCurrentBaby } from '../../app/BabyContext'
import { Feeds } from '../../shared/db'

type Contents = 'formula' | 'breastmilk'

interface Props {
  defaultAmount: number
  defaultContents: Contents
  onClose: () => void
}

export function BottleForm({ defaultAmount, defaultContents, onClose }: Props) {
  const baby = useCurrentBaby()
  const [amount, setAmount] = useState<string>(String(defaultAmount))
  const [contents, setContents] = useState<Contents>(defaultContents)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ml = parseInt(amount, 10)
    if (!Number.isFinite(ml) || ml <= 0) return
    const t = Date.now()
    void Feeds.createBottleFeed({
      babyId: baby.id,
      startedAt: t,
      endedAt: t,
      amountMl: ml,
      contents,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Amount (ml)</span>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max="500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
          className="px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary tabular-nums"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        {(['formula', 'breastmilk'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setContents(c)}
            className={`py-2 rounded-xl border text-sm font-medium transition ${
              contents === c
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-muted-foreground'
            }`}
          >
            {c === 'formula' ? 'Formula' : 'Breastmilk'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onClose}
          className="py-3 rounded-xl border border-border bg-background text-foreground hover:border-muted-foreground transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition active:scale-95"
        >
          Save
        </button>
      </div>
    </form>
  )
}
