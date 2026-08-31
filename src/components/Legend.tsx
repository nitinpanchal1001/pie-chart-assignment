import type { Metric } from '../lib/metrics'
import { shareOf } from '../lib/metrics'
import type { Mode } from '../lib/palette'
import { SERIES } from '../lib/palette'

/**
 * The legend is the dependable identity channel — always present, and it carries
 * the numbers too, so no value is reachable only through a hover tooltip.
 *
 * 210px is the largest column minimum that still fits four across inside the
 * 940px cap; it drops to 2x2 at tablet width and one column on a phone.
 */
export default function Legend({ metrics, mode }: { metrics: Metric[]; mode: Mode }) {
  return (
    <ul
      className="mx-auto mt-[18px] grid max-w-[940px] gap-x-6 gap-y-0.5 border-t
        border-hairline pt-4 [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]"
    >
      {metrics.map((metric) => (
        <li
          className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-baseline gap-x-[9px] py-[7px]"
          key={metric.key}
        >
          <span
            className="size-[9px] self-center rounded-full"
            style={{ background: SERIES[mode][metric.key] }}
          />
          <span className="truncate text-[13px] text-ink-1">{metric.label}</span>
          <span className="text-[15px] font-semibold tabular-nums text-ink-1">{metric.value}</span>
          <span className="col-start-2 -col-end-1 text-[11.5px] text-ink-3">
            {shareOf(metric, metrics)}% of total
          </span>
        </li>
      ))}
    </ul>
  )
}
