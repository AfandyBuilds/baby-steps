import { type FormEvent, useState } from 'react'
import { useCurrentBaby } from '../../app/BabyContext'
import { Feeds } from '../../shared/db'

interface Props {
  recentFoods: string[]
  onClose: () => void
}

export function SolidForm({ recentFoods, onClose }: Props) {
  const baby = useCurrentBaby()
  const [food, setFood] = useState('')
  const [isFirstTry, setIsFirstTry] = useState(false)
  const [reactionNotes, setReactionNotes] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = food.trim()
    if (!trimmed) return
    const reaction = reactionNotes.trim()
    void Feeds.createSolidFeed({
      babyId: baby.id,
      startedAt: Date.now(),
      food: trimmed,
      isFirstTry,
      reactionNotes: reaction ? reaction : undefined,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">Food</span>
        <input
          type="text"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          placeholder="e.g. avocado"
          required
          autoFocus
          className="px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>

      {recentFoods.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recentFoods.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFood(name)}
              className="px-3 py-1 rounded-full border border-border bg-background text-xs hover:border-muted-foreground transition"
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isFirstTry}
          onChange={(e) => setIsFirstTry(e.target.checked)}
          className="w-4 h-4 rounded border-border accent-primary"
        />
        <span className="text-sm">First time trying this food</span>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium">
          Reaction <span className="text-muted-foreground font-normal">(optional)</span>
        </span>
        <textarea
          value={reactionNotes}
          onChange={(e) => setReactionNotes(e.target.value)}
          rows={2}
          placeholder="loved it / made a face / rash a few hours later"
          className="px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </label>

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
