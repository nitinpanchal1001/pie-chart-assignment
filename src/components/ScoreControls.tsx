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
                <span className="sr-only">{`Value for ${metric.label}, 0 to 100`}</span>
                <input
                  type="number"
                  min={MIN}
                  max={MAX}
                  value={metric.value}
                  className="w-[62px] rounded-[7px] border border-edge bg-surface px-2 py-[5px]
                    text-right text-sm font-semibold tabular-nums"
                  onChange={(event) => onValueChange(metric.key, Number(event.target.value))}
                  onBlur={(event) => onValueChange(metric.key, clamp(Number(event.target.value)))}
                />
              </label>
            </div>
            <p className="mt-1.5 text-[11.5px] text-ink-3">{ring}</p>
          </div>
        )
      })}
    </div>
  )
}
