import { useId, useState } from 'react'
import type { Metric } from '../lib/metrics'
import { MAX } from '../lib/metrics'
import type { Mode, MetricKey } from '../lib/palette'
import { CHROME, INK, SERIES } from '../lib/palette'

/**
 * Ring geometry. One ring per signal, concentric, outermost = signal A.
 *
 * A ring is drawn only as far as its score: 70 draws seven tenths of a circle and
 * nothing more. There is no track behind it — the arc's own length is the whole
 * mark, so the reader is never comparing a filled part against an unfilled one.
 *
 * A slim rounded stem runs from the centre straight down to the foot of the
 * chart. Every ring opens on the LEFT of that stem, sweeps clockwise, and a ring
 * at 100 closes on its RIGHT — so the stem reads as the zero mark and the finish
 * line at once, and no ring ever closes into an unreadable full circle.
 *
 * The clearance either side of the stem is a fixed DISTANCE, not a fixed angle,
 * so all four openings line up flush against the stem. The cost is that an inner
 * ring spends slightly more of its circumference on that gap than an outer one:
 * a full track is 349deg on the outer ring and 335deg on the inner one. Fractions
 * are therefore taken of each ring's own track, and — as with any radial chart —
 * every value is also printed in the legend and the table rather than being left
 * to the arc.
 */
const SIZE = 360
const CENTER = SIZE / 2
const RING_WIDTH = 18
const RING_STEP = 28 // leaves a 10px gap of surface between neighbouring rings
const OUTER_RADIUS = 154
const HIT_WIDTH = 26 // hover/focus target, comfortably past the 24px minimum

const STEM_WIDTH = 6
const STEM_TOP = 228 // clears the centre figure, still inside the ring hole
const STEM_BOTTOM = 346 // a touch past the outer ring's edge
/** Distance from the stem's centreline to the visible edge of every arc. */
const STEM_CLEARANCE = STEM_WIDTH / 2 + 3

const radiusFor = (index: number) => OUTER_RADIUS - index * RING_STEP

/**
 * A round linecap pushes half a stroke width past the drawn end, so the path has
 * to stop that much short for the cap to land on the clearance line.
 */
const halfGapFor = (radius: number) =>
  (Math.asin((STEM_CLEARANCE + RING_WIDTH / 2) / radius) * 180) / Math.PI

/** 0deg is 3 o'clock; angles increase clockwise, matching SVG's y-down axis. */
function polar(radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  }
}

function arcPath(radius: number, startDeg: number, endDeg: number): string {
  const start = polar(radius, startDeg)
  const end = polar(radius, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

interface Props {
  metrics: Metric[]
  mode: Mode
  composite: number
  svgRef?: React.Ref<SVGSVGElement>
}

interface Hover {
  key: MetricKey
  x: number
  y: number
}

export default function RadialRings({ metrics, mode, composite, svgRef }: Props) {
  const [hover, setHover] = useState<Hover | null>(null)
  const [focused, setFocused] = useState<MetricKey | null>(null)
  const titleId = useId()

  const active = hover?.key ?? focused
  const activeMetric = metrics.find((metric) => metric.key === active) ?? null
  const chrome = CHROME[mode]
  const ink = INK[mode]

  const headline = activeMetric ? activeMetric.value : composite
  // The centre hole is 122px across, so the eyebrow is capped to what fits in it.
  const rawEyebrow = activeMetric ? activeMetric.label : 'Lead score'
  const eyebrow = rawEyebrow.length > 13 ? `${rawEyebrow.slice(0, 12)}…` : rawEyebrow

  return (
    // Sized off the viewport height as well as its column, so the chart fills the
    // screen on a tall window without ever outgrowing a short one. Everything in
    // the SVG scales with it, the hero figure included, since the viewBox is fixed.
    <div className="relative mx-auto mt-[18px] mb-1.5 w-[min(100%,620px,56vh)] max-[940px]:w-[min(100%,620px)]">
      <svg
        ref={svgRef}
        className="block h-auto w-full overflow-visible"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-labelledby={titleId}
        onPointerLeave={() => setHover(null)}
      >
        <title id={titleId}>
          {`Concentric ring chart. Composite lead score ${composite} out of 100. ` +
            metrics.map((metric) => `${metric.label} ${metric.value}`).join(', ') + '.'}
        </title>

        {metrics.map((metric, index) => {
          const radius = radiusFor(index)
          const halfGap = halfGapFor(radius)
          const startDeg = 90 + halfGap // just left of the stem
          const sweep = 360 - 2 * halfGap // ...round to just right of it
          const fraction = metric.value / MAX
          const endDeg = startDeg + sweep * fraction

          const color = SERIES[mode][metric.key]
          const isActive = active === metric.key
          const dimmed = active !== null && !isActive
          // A round cap only goes on once the arc is long enough that the cap
          // cannot overstate the value.
          const arcLength = 2 * Math.PI * radius * (sweep / 360) * fraction
          const linecap = arcLength > RING_WIDTH ? 'round' : 'butt'
          const end = polar(radius, endDeg)
          // With no track to hover, the hit area and focus outline hug the arc —
          // except at zero, where a full-length one keeps the ring reachable.
          const outlineDash = metric.value > 0 ? `${metric.value} ${MAX}` : undefined

          return (
            <g
              key={metric.key}
              className={`cursor-pointer outline-none transition-opacity duration-150 ${
                dimmed ? 'opacity-[0.34]' : 'opacity-100'
              }`}
              tabIndex={0}
              role="button"
              aria-label={`${metric.label}: ${metric.value} out of ${MAX}`}
              onFocus={() => setFocused(metric.key)}
              onBlur={() => setFocused(null)}
            >
              {/* pathLength normalises the track to 100 units, so the dash is
                  literally the score and it can tween between values. */}
              {metric.value > 0 && (
                <path
                  className="[transition:stroke-dasharray_420ms_cubic-bezier(0.22,1,0.36,1)]"
                  d={arcPath(radius, startDeg, startDeg + sweep)}
                  fill="none"
                  stroke={color}
                  strokeWidth={RING_WIDTH}
                  strokeLinecap={linecap}
                  pathLength={MAX}
                  strokeDasharray={`${metric.value} ${MAX}`}
                />
              )}
              {linecap === 'round' && (
                // End marker: 10px dot carrying a 2px surface ring, so it stays
                // legible where it meets its own track. It is dropped on arcs too
                // short to outgrow it, where it would sit on top of the whole mark.
                <circle cx={end.x} cy={end.y} r={5} fill={color} stroke={chrome.surface} strokeWidth={2} />
              )}
              {isActive && (
                <path
                  d={arcPath(radius + RING_WIDTH / 2 + 3, startDeg, startDeg + sweep)}
                  fill="none"
                  stroke={ink.muted}
                  strokeWidth={1}
                  strokeLinecap="round"
                  pathLength={MAX}
                  strokeDasharray={outlineDash}
                />
              )}
              <path
                className="[pointer-events:stroke]"
                d={arcPath(radius, startDeg, startDeg + sweep)}
                fill="none"
                stroke="transparent"
                strokeWidth={HIT_WIDTH}
                pathLength={MAX}
                strokeDasharray={outlineDash}
                onPointerMove={(event) => {
                  const box = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
                  setHover({
                    key: metric.key,
                    x: event.clientX - box.left,
                    y: event.clientY - box.top,
                  })
                }}
              />
            </g>
          )
        })}

        {/* The stem: where every ring starts and finishes. */}
        <line
          x1={CENTER}
          y1={STEM_TOP}
          x2={CENTER}
          y2={STEM_BOTTOM}
          stroke={chrome.stem}
          strokeWidth={STEM_WIDTH}
          strokeLinecap="round"
        />

        <text x={CENTER} y={148} textAnchor="middle" fill={ink.muted} className="rings__eyebrow">
          {eyebrow}
        </text>
        <text x={CENTER} y={194} textAnchor="middle" fill={ink.primary} className="rings__figure">
          {headline}
        </text>
        <text x={CENTER} y={216} textAnchor="middle" fill={ink.muted} className="rings__unit">
          out of 100
        </text>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-[2] flex translate-x-[14px] -translate-y-1/2
            items-center gap-2 rounded-lg border border-edge bg-raised px-2.5 py-1.5
            text-[12.5px] whitespace-nowrap shadow-card"
          style={{ left: hover.x, top: hover.y }}
          role="status"
          aria-live="polite"
        >
          <span
            className="size-[9px] flex-none rounded-full"
            style={{ background: SERIES[mode][hover.key] }}
          />
          <span className="text-ink-2">
            {metrics.find((metric) => metric.key === hover.key)?.label}
          </span>
          <span className="font-semibold tabular-nums text-ink-1">
            {metrics.find((metric) => metric.key === hover.key)?.value}
          </span>
        </div>
      )}
    </div>
  )
}
