# Lead Score

Four signals — **A, B, C, D** — each scored 0–100, drawn as four concentric rings.
Type or drag a value and the rings redraw; rename any signal to whatever the four
variables turn out to be.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
```

React 19 + TypeScript + Vite, styled with **Tailwind CSS v4** (the `@tailwindcss/vite`
plugin — no PostCSS config, no `tailwind.config.js`). No chart library: the rings
are hand-drawn SVG, so the geometry, the colour and the export are all under
direct control.

### How the theming works

The tokens stay plain custom properties on `:root` / `:root[data-theme="dark"]`,
because they have to swap at *runtime* — an inline script stamps the resolved
theme on `<html>` before first paint. `@theme inline` then maps them onto Tailwind
colour utilities:

```css
@theme inline {
  --color-surface: var(--surface);
  --color-ink-1:   var(--ink-1);
}
```

`inline` is what makes `bg-surface` compile to `var(--surface)` rather than a
frozen hex, so flipping `data-theme` re-themes the whole app with no extra CSS and
no `dark:` variant on a single element.

Three things stay hand-written in `@layer components`, because they have no
utility equivalent: the range input (styled entirely through `::-webkit-slider-thumb`
and friends) and the three `.rings__*` type classes that set the centre figure's
typography inside the SVG.

## How to read the chart

A ring is drawn **only as far as its score**. A value of 70 draws seven tenths of a
circle and nothing more — there is no track behind it, so the reader is never
comparing a filled part against an unfilled one. The arc's own length is the mark.

A slim rounded **stem** runs from the centre down to the foot of the chart. Every
ring opens on the **left** of that stem and sweeps clockwise; a ring at 100 closes
on its **right**. So the stem is the zero mark and the finish line at once, and a
full ring never closes into an unreadable circle.

The clearance either side of the stem is a fixed *distance*, not a fixed angle, so
all four openings line up flush against it. The cost is that an inner ring spends
slightly more of its circumference on that gap than an outer one: a complete sweep
is 349° on the outer ring and 335° on the inner one. That, plus the fact that an
inner arc is physically shorter at the same value, is the known distortion in every
radial chart. The mitigation is that no value is ever carried by the arc alone —
each one is printed in the legend, echoed in the centre on hover, and available in
the table view.

The centre holds the **composite**: the unweighted mean of the four signals.
Hovering or tabbing to a ring swaps the centre to that signal's own number.

## Colour

The four hues are slots 1–4 of a categorical palette that was run through a
colour-vision-deficiency validator before anything was drawn:

| Mode | Worst adjacent pair, CVD ΔE | Normal vision ΔE |
|---|---|---|
| Light | 9.1 | 22.9 |
| Dark | 8.4 | 19.8 |

Both clear the ≥ 8 CVD target and the ≥ 15 normal-vision floor, so the rings stay
tellable apart for protan, deutan and tritan readers. Two light-mode steps sit
below 3:1 against the surface; the relief for that is the always-visible legend
values and the table view.

Dark mode is a **selected** set of steps for the dark surface, not an inverted
light palette. Colour is bound to the metric key (`a`–`d`), never to its rank, so
renaming or re-ordering never repaints the others.

## Accessibility

- Every ring is keyboard-focusable and announces `label: value out of 100`.
- Hit targets are 26px wide — the visible stroke is 18px.
- The legend is always present and carries the numbers, so nothing is reachable
  only through a tooltip.
- A table view is the WCAG-clean twin of the chart.
- `prefers-reduced-motion` disables the arc transition; `prefers-color-scheme`
  drives the default theme, overridable by the Light / Dark / Auto control.

## Structure

```
src/
  App.tsx                    layout, composition
  components/
    RadialRings.tsx          the SVG chart: geometry, hover, focus, centre figure
    ScoreControls.tsx        renameable label + slider + number input per signal
    Legend.tsx               identity channel, always on
    ThemeToggle.tsx          light / dark / auto
  styles/global.css          tokens, @theme mapping, the few non-utility rules
  lib/
    ui.ts                    shared utility strings for repeated chrome
    palette.ts               validated series hues, chrome, ink, status
    metrics.ts               model, clamping, composite, shares
    useLeadScore.ts          state + localStorage, hardened against stale payloads
    useTheme.ts              preference → resolved mode, stamped on <html>
```

Values and the theme choice persist in `localStorage`; every read is guarded, so
a private window or blocked site data just falls back to the defaults.
