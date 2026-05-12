import { DiaperHistoryList } from '../features/diapers/DiaperHistoryList'
import { FeedHistoryList } from '../features/feeds/FeedHistoryList'
import { SleepHistoryList } from '../features/sleep/SleepHistoryList'

export function HistoryPage() {
  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-medium">History</h1>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Feeds
        </h2>
        <FeedHistoryList />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Sleep
        </h2>
        <SleepHistoryList />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Diapers
        </h2>
        <DiaperHistoryList />
      </section>
    </section>
  )
}
