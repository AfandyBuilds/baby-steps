import { type ReactNode, useEffect, useState } from 'react'
import { ThemeContext, type ResolvedTheme, type ThemeMode } from './ThemeContext'

const STORAGE_KEY = 'baby-steps.theme'

function readStoredMode(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode)
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark)

  // When mode === 'system', follow OS-level changes (e.g. night-shift kicking in).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved: ResolvedTheme = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  function setMode(next: ThemeMode) {
    window.localStorage.setItem(STORAGE_KEY, next)
    setModeState(next)
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolved }}>{children}</ThemeContext.Provider>
  )
}
