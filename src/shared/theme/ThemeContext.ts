import { createContext } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  mode: ThemeMode
  setMode: (next: ThemeMode) => void
  resolved: ResolvedTheme
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
