import { useCallback, useEffect, useState } from 'react'
import type { Metric } from './metrics'
import { DEFAULT_METRICS, METRIC_KEYS, clamp } from './metrics'
import type { MetricKey } from './palette'

const STORAGE_KEY = 'lead-score:metrics'

function readMetrics(): Metric[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_METRICS
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return DEFAULT_METRICS
    // Rebuild from the canonical key list so a hand-edited or stale payload can
    // never drop a ring or invent a fifth one.
    return METRIC_KEYS.map((key, index) => {
      const stored = parsed.find(
        (entry): entry is Metric =>
          typeof entry === 'object' && entry !== null && (entry as Metric).key === key,
      )
      const fallback = DEFAULT_METRICS[index]
      return {
        key,
        label: typeof stored?.label === 'string' && stored.label.trim() ? stored.label : fallback.label,
        value: clamp(Number(stored?.value ?? fallback.value)),
      }
    })
  } catch {
    return DEFAULT_METRICS
  }
}

export function useLeadScore() {
  const [metrics, setMetrics] = useState<Metric[]>(readMetrics)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics))
    } catch {
      /* values simply will not persist across reloads */
    }
  }, [metrics])

  const setValue = useCallback((key: MetricKey, value: number) => {
    setMetrics((current) =>
      current.map((metric) => (metric.key === key ? { ...metric, value: clamp(value) } : metric)),
    )
  }, [])

  const setLabel = useCallback((key: MetricKey, label: string) => {
    setMetrics((current) =>
      current.map((metric) => (metric.key === key ? { ...metric, label } : metric)),
    )
  }, [])

  const reset = useCallback(() => setMetrics(DEFAULT_METRICS), [])

  const randomize = useCallback(() => {
    setMetrics((current) =>
      current.map((metric) => ({ ...metric, value: Math.floor(Math.random() * 101) })),
    )
  }, [])

  return { metrics, setValue, setLabel, reset, randomize }
}
