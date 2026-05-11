import { DiaperHistoryList } from '../features/diapers/DiaperHistoryList'

export function HistoryPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-medium">History</h1>
      <DiaperHistoryList />
    </section>
  )
}
