import { useCallback, useEffect, useState } from 'react'
import type { Mode } from './palette'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'lead-score:theme'

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    /* storage can be unavailable (private windows, blocked site data) */
  }
  return 'system'
}

function resolve(preference: ThemePreference): Mode {
  if (preference !== 'system') return preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Resolves the preference to a concrete mode and stamps it on <html>, so the
 * CSS only ever has to key off [data-theme] and the SVG can be handed literal
 * hex values (which is also what makes the export self-contained).
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference)
  const [mode, setMode] = useState<Mode>(() => resolve(readPreference()))

  useEffect(() => {
    const apply = () => {
      const next = resolve(preference)
      setMode(next)
      document.documentElement.dataset.theme = next
    }
    apply()
    try {
      localStorage.setItem(STORAGE_KEY, preference)
    } catch {
      /* preference simply will not persist */
    }
    if (preference !== 'system') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [preference])

  const cycle = useCallback(() => {
    setPreference((current) =>
      current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light',
    )
  }, [])

  return { preference, mode, setPreference, cycle }
}
