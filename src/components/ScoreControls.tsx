import { useEffect, useId, useState } from 'react'
import type { Metric } from '../lib/metrics'
import { MAX, MIN, clamp } from '../lib/metrics'
import type { Mode, MetricKey } from '../lib/palette'
import { SERIES } from '../lib/palette'

interface Props {
  metrics: Metric[]
  mode: Mode
  onValueChange: (key: MetricKey, value: number) => void
  onLabelChange: (key: MetricKey, label: string) => void
}

interface FieldProps {
  metric: Metric
  /** The line printed under the row while the entry is valid. */
  hint: string
  onValueChange: (key: MetricKey, value: number) => void
}

/**
 * The number entry, its slider, and the one line beneath them.
 *
 * The committed score is always inside 0-100, so a field bound straight to it
 * could never hold an out-of-range entry long enough to complain about one —
 * typing 150 would just show 100. So what is typed is kept in a draft of its
 * own: only an in-range entry is committed to the chart, anything else stays in
 * the field, wearing a message, until it is corrected or the field is left.
 */
function ValueField({ metric, hint, onValueChange }: FieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const messageId = useId()

  // A committed change — this field, the slider, Randomise, Reset — is the
  // authority again, so the draft steps aside.
  useEffect(() => setDraft(null), [metric.value])

  const shown = draft ?? String(metric.value)
  const typed = Number(shown)
  const isBlank = shown.trim() === ''
  const invalid = !isBlank && (!Number.isFinite(typed) || typed < MIN || typed > MAX)

  const handleChange = (raw: string) => {
    setDraft(raw)
    const next = Number(raw)
    if (raw.trim() !== '' && Number.isFinite(next) && next >= MIN && next <= MAX) {
      onValueChange(metric.key, next)
    }
  }

  // Leaving the field settles it: an out-of-range entry is pulled to the nearest
  // end of the range, an empty or unreadable one falls back to the last score.
  const handleBlur = () => {
    if (!isBlank && Number.isFinite(typed)) onValueChange(metric.key, clamp(typed))
    setDraft(null)
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <input
          className="slider min-w-0 flex-1"
          style={{ ['--fill' as string]: `${metric.value}%` }}
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={metric.value}
          aria-label={`${metric.label} score`}
          onChange={(event) => onValueChange(metric.key, Number(event.target.value))}
        />
        <label className="flex-none">
          <span className="sr-only">{`Value for ${metric.label}, ${MIN} to ${MAX}`}</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            value={shown}
            aria-invalid={invalid}
            aria-describedby={messageId}
            className={`w-[62px] rounded-[7px] border bg-surface px-2 py-[5px] text-right text-sm
              font-semibold tabular-nums transition-[border-color,box-shadow,background-color] duration-150 ${
                invalid
                  ? 'field-nudge border-danger-edge bg-danger-soft text-danger [box-shadow:0_0_0_3px_var(--danger-soft)]'
                  : 'border-edge'
              }`}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={handleBlur}
          />
        </label>
      </div>

      {/* One line, two states — the hint gives way to the message in place, so
          nothing below it shifts when a value goes out of range. */}
      <p className="mt-1.5 min-h-[17px] text-[11.5px]">
        {invalid ? (
          <span
            id={messageId}
            role="alert"
            className="message-rise flex items-center gap-1.5 font-medium text-danger"
          >
            <svg
              className="size-[13px] flex-none"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="8" cy="8" r="6.4" />
              <path d="M8 4.9v3.6" />
              <path d="M8 11.05v.05" />
            </svg>
            {`Only ${MIN} to ${MAX} is allowed`}
          </span>
        ) : (
          <span id={messageId} className="text-ink-3">
            {hint}
          </span>
        )}
      </p>
    </>
  )
}

export default function ScoreControls({ metrics, mode, onValueChange, onLabelChange }: Props) {
  return (
    // Side by side once there is room, so the four signals read as one set of
    // dials rather than a list.
    <div className="mt-[18px] grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(238px,1fr))]">
      {metrics.map((metric, index) => {
        const color = SERIES[mode][metric.key]
        const ring =
          index === 0 ? 'Outer ring' : index === metrics.length - 1 ? 'Inner ring' : `Ring ${index + 1}`
        return (
          <div
            className="rounded-[11px] border border-edge bg-plane px-4 pt-3.5 pb-4"
            key={metric.key}
            style={{ ['--series' as string]: color }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span
                className="grid size-[22px] flex-none place-items-center rounded-md text-[11px] font-semibold text-ink-1"
                style={{
                  background: `color-mix(in srgb, ${color} 16%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 45%, transparent)`,
                }}
                aria-hidden="true"
              >
                {metric.key.toUpperCase()}
              </span>
              <label className="min-w-0 flex-1">
                <span className="sr-only">{`Name for signal ${metric.key.toUpperCase()}`}</span>
                <input
                  type="text"
                  value={metric.label}
                  maxLength={32}
                  placeholder={`Signal ${metric.key.toUpperCase()}`}
                  className="-ml-[7px] w-full rounded-[7px] border border-transparent px-[7px] py-1
                    text-sm font-medium transition-colors hover:border-edge focus:border-edge focus:bg-surface"
                  onChange={(event) => onLabelChange(metric.key, event.target.value)}
                />
              </label>
            </div>

            <ValueField metric={metric} hint={ring} onValueChange={onValueChange} />
          </div>
        )
      })}
    </div>
  )
}
