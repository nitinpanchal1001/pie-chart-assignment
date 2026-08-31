import type { MetricKey } from './palette'

export interface Metric {
  key: MetricKey
  /** Editable — rename it to whatever the four signals turn out to be. */
  label: string
  value: number
}

export const METRIC_KEYS: MetricKey[] = ['a', 'b', 'c', 'd']

/** Placeholder names for a lead-scoring model. Every one is renameable. */
export const DEFAULT_METRICS: Metric[] = [
  { key: 'a', label: 'Engagement', value: 78 },
  { key: 'b', label: 'Firmographic fit', value: 64 },
  { key: 'c', label: 'Buying intent', value: 52 },
  { key: 'd', label: 'Recency', value: 35 },
]

export const MIN = 0
export const MAX = 100

/** Snap an arbitrary input to a whole number inside the 0-100 range. */
export function clamp(value: number): number {
  if (!Number.isFinite(value)) return MIN
  return Math.min(MAX, Math.max(MIN, Math.round(value)))
}

/** The composite is the unweighted mean of the four signals. */
export function compositeScore(metrics: Metric[]): number {
  if (metrics.length === 0) return 0
  const sum = metrics.reduce((total, metric) => total + metric.value, 0)
  return Math.round(sum / metrics.length)
}

/** Each signal's share of the four values summed, as a percentage. */
export function shareOf(metric: Metric, metrics: Metric[]): number {
  const total = metrics.reduce((sum, entry) => sum + entry.value, 0)
  if (total === 0) return 0
  return Math.round((metric.value / total) * 100)
}
