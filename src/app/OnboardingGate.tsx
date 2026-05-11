import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Babies } from '../shared/db'
import { BabyContext } from './BabyContext'

/**
 * Wraps all routes that require an existing baby. Three states:
 *   - undefined  → IndexedDB query still in flight (render nothing briefly)
 *   - null       → no baby found, redirect to /onboarding
 *   - BabyRecord → render children with BabyContext populated
 *
 * The wrapper around getCurrentBaby() coerces undefined → null so the
 * `undefined === loading` signal stays unambiguous.
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const baby = useLiveQuery(async () => (await Babies.getCurrentBaby()) ?? null)

  if (baby === undefined) {
    return <div className="min-h-screen bg-background" />
  }
  if (baby === null) {
    return <Navigate to="/onboarding" replace />
  }
  return <BabyContext.Provider value={baby}>{children}</BabyContext.Provider>
}
