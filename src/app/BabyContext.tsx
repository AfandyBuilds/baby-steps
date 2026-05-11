import { createContext, useContext } from 'react'
import type { BabyRecord } from '../shared/db'

export const BabyContext = createContext<BabyRecord | null>(null)

/**
 * Returns the active baby for this session. Throws if used outside an
 * <OnboardingGate>, which is intentional — every authed route is wrapped
 * by the gate, so missing context means a routing mistake, not a real
 * "no baby" state.
 */
export function useCurrentBaby(): BabyRecord {
  const baby = useContext(BabyContext)
  if (!baby) {
    throw new Error('useCurrentBaby must be used inside <OnboardingGate>')
  }
  return baby
}
