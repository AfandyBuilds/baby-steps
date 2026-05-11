import { useCurrentBaby } from '../app/BabyContext'
import { DiaperQuickLog } from '../features/diapers/DiaperQuickLog'

export function HomePage() {
  const baby = useCurrentBaby()
  return (
    <section className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Hi,</p>
        <h1 className="text-3xl font-medium">{baby.name}</h1>
      </header>
      <DiaperQuickLog />
    </section>
  )
}
