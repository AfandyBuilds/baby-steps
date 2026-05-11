import { useCurrentBaby } from '../app/BabyContext'

export function HomePage() {
  const baby = useCurrentBaby()
  return (
    <section className="space-y-4">
      <header>
        <p className="text-sm text-muted-foreground">Hi,</p>
        <h1 className="text-3xl font-medium">{baby.name}</h1>
      </header>
      <p className="text-sm text-muted-foreground">
        Trackers arrive next — diapers, then sleep, then feeds.
      </p>
    </section>
  )
}
