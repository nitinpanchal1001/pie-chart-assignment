import { useMemo, useRef, useState } from 'react'
import Legend from './components/Legend'
import RadialRings from './components/RadialRings'
import ScoreControls from './components/ScoreControls'
import TableView from './components/TableView'
import ThemeToggle from './components/ThemeToggle'
import { downloadPng, downloadSvg } from './lib/download'
import { compositeScore } from './lib/metrics'
import { BODY_COPY, BUTTON, CARD, CARD_HEAD, CARD_TITLE } from './lib/ui'
import { useLeadScore } from './lib/useLeadScore'
import { useTheme } from './lib/useTheme'

export default function App() {
  const { metrics, setValue, setLabel, reset, randomize } = useLeadScore()
  const { preference, mode, setPreference } = useTheme()
  const [showTable, setShowTable] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const composite = useMemo(() => compositeScore(metrics), [metrics])
  const values = metrics.map((metric) => metric.value)

  return (
    <div className="mx-auto max-w-[1160px] px-[18px] pt-7 pb-14 min-[940px]:px-7 min-[940px]:pt-2 min-[940px]:pb-[72px] ">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-6 border-b border-hairline pb-6">
        <div className="flex items-center gap-3.5">
          {/* Three nested arcs — the chart, reduced to a monogram. */}
          <span className="relative size-[34px] flex-none" aria-hidden="true">
            <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#2a78d6] border-r-[#2a78d6]" />
            <span className="absolute inset-[6px] rounded-full border-2 border-transparent border-t-[#eb6834]" />
            <span className="absolute inset-[12px] rounded-full border-2 border-transparent border-t-[#1baf7a] border-l-[#1baf7a]" />
          </span>
          <div>
            <h1 className="text-[19px] font-semibold tracking-[-0.015em]">Lead Score</h1>
            <p className="text-[13px] text-ink-2">Four signals, 0–100 each, read as concentric rings.</p>
          </div>
        </div>
        <ThemeToggle preference={preference} onChange={setPreference} />
      </header>

      {/* One column: the chart leads at full width, the inputs sit under it. */}
      <main className="grid grid-cols-1 gap-5">
        <section className={CARD} aria-labelledby="chart-heading">
          <div className={CARD_HEAD}>
            <h2 id="chart-heading" className={CARD_TITLE}>Score profile</h2>
          </div>

          <RadialRings metrics={metrics} mode={mode} composite={composite} svgRef={svgRef} />

          <Legend metrics={metrics} mode={mode} />

          {/* <p className={`${BODY_COPY} mx-auto mt-[18px] border-t border-hairline pt-4 text-[12px] text-ink-3`}>
            A ring is drawn only as far as its score — 70 draws{' '}
            <em className="font-semibold text-ink-2 not-italic">seven tenths of a circle</em>, with
            nothing behind it. Each opens on the left of the stem and sweeps clockwise, closing on
            its right at 100. Arc size is never the only reading: every value is printed above and in
            the table.
          </p> */}

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" className={BUTTON} onClick={() => setShowTable((open) => !open)} aria-expanded={showTable}>
              {showTable ? 'Hide table' : 'Show table'}
            </button>
            <button type="button" className={BUTTON} onClick={() => svgRef.current && downloadSvg(svgRef.current, mode)}>
              Export SVG
            </button>
            <button type="button" className={BUTTON} onClick={() => svgRef.current && downloadPng(svgRef.current, mode)}>
              Export PNG
            </button>
          </div>

          {showTable && (
            <div className="mt-[18px] overflow-x-auto">
              <TableView metrics={metrics} />
            </div>
          )}
        </section>

        <section className={CARD} aria-labelledby="inputs-heading">
          <div className={CARD_HEAD}>
            <h2 id="inputs-heading" className={CARD_TITLE}>Inputs</h2>
            <div className="flex gap-2">
              <button type="button" className={BUTTON} onClick={randomize}>Randomise</button>
              <button type="button" className={BUTTON} onClick={reset}>Reset</button>
            </div>
          </div>

          <p className={BODY_COPY}>
            Rename any signal — the four placeholders are only a starting point. Values are whole
            numbers from 0 to 100 and persist in this browser.
          </p>

          <ScoreControls
            metrics={metrics}
            mode={mode}
            onValueChange={setValue}
            onLabelChange={setLabel}
          />

          <dl className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-hairline bg-hairline min-[520px]:grid-cols-2">
            <div className="bg-surface px-3.5 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Composite</dt>
              <dd className="mt-0.5 text-[22px] font-semibold tracking-[-0.01em]">{composite}</dd>
            </div>
            <div className="bg-surface px-3.5 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-3">Spread</dt>
              <dd className="mt-0.5 text-[22px] font-semibold tracking-[-0.01em]">
                {Math.max(...values) - Math.min(...values)}
              </dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  )
}
