import type { Metric } from '../lib/metrics'
import { compositeScore, shareOf } from '../lib/metrics'

const CELL = 'border-b border-hairline px-3 py-[9px] text-left'
const HEAD = `${CELL} text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3`
const FOOT = 'px-3 py-[9px] text-left font-semibold'

/** The WCAG-clean twin of the chart: every value readable without colour. */
export default function TableView({ metrics }: { metrics: Metric[] }) {
  const composite = compositeScore(metrics)
  return (
    <table className="w-full border-collapse text-[13px] tabular-nums">
      <caption className="sr-only">Lead score inputs and their share of the total</caption>
      <thead>
        <tr>
          <th scope="col" className={HEAD}>Key</th>
          <th scope="col" className={HEAD}>Signal</th>
          <th scope="col" className={`${HEAD} text-right`}>Score</th>
          <th scope="col" className={`${HEAD} text-right`}>Share of total</th>
        </tr>
      </thead>
      <tbody>
        {metrics.map((metric) => (
          <tr key={metric.key} className="hover:bg-plane">
            <td className={`${CELL} font-semibold text-ink-3`}>{metric.key.toUpperCase()}</td>
            <td className={CELL}>{metric.label}</td>
            <td className={`${CELL} text-right`}>{metric.value}</td>
            <td className={`${CELL} text-right`}>{shareOf(metric, metrics)}%</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className={FOOT} />
          <th scope="row" className={FOOT}>Composite (mean)</th>
          <td className={`${FOOT} text-right`}>{composite}</td>
          <td className={FOOT} />
        </tr>
      </tfoot>
    </table>
  )
}
