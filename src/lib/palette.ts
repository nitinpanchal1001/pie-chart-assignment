/**
 * Colour tokens.
 *
 * The four series hues are slots 1-4 of a categorical palette that was checked
 * with a CVD validator before anything was drawn:
 *
 *   light  worst adjacent pair  CVD dE 9.1 · normal-vision dE 22.9
 *   dark   worst adjacent pair  CVD dE 8.4 · normal-vision dE 19.8
 *
 * Both modes clear the >= 8 CVD target and the >= 15 normal-vision floor, so the
 * rings stay tellable apart for protan / deutan / tritan readers. Two of the
 * light steps sit below 3:1 against the light surface; the relief for that is
 * the visible legend values and the table view, both of which always ship.
 *
 * Colour is bound to the metric KEY (a/b/c/d), never to its rank or its row
 * position, so re-ordering or renaming a metric never repaints the others.
 */

export type Mode = 'light' | 'dark'
export type MetricKey = 'a' | 'b' | 'c' | 'd'

export const SERIES: Record<Mode, Record<MetricKey, string>> = {
  light: { a: '#2a78d6', b: '#eb6834', c: '#1baf7a', d: '#eda100' },
  dark: { a: '#3987e5', b: '#d95926', c: '#199e70', d: '#c98500' },
}

/** Chart chrome — everything that is not data ink. */
export const CHROME: Record<
  Mode,
  { surface: string; track: string; stem: string; hairline: string; muted: string }
> = {
  light: { surface: '#fcfcfb', track: '#eceae4', stem: '#dcdad2', hairline: '#e1e0d9', muted: '#898781' },
  dark: { surface: '#1a1a19', track: '#282826', stem: '#343430', hairline: '#2c2c2a', muted: '#898781' },
}

/** Text tokens. Labels never wear a series colour — the mark beside them does. */
export const INK: Record<Mode, { primary: string; secondary: string; muted: string }> = {
  light: { primary: '#0b0b0b', secondary: '#52514e', muted: '#898781' },
  dark: { primary: '#ffffff', secondary: '#c3c2b7', muted: '#898781' },
}
