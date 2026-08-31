import { CHROME } from './palette'
import type { Mode } from './palette'

/**
 * The SVG is drawn with literal hex attributes rather than CSS variables, so the
 * only thing an export has to re-attach is the type styling.
 */
const EXPORT_STYLE = `
  text { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  .rings__eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
  .rings__figure  { font-size: 54px; font-weight: 600; letter-spacing: -0.02em; }
  .rings__unit    { font-size: 11px; font-weight: 500; }
`

function serialize(svg: SVGSVGElement, mode: Mode): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', '720')
  clone.setAttribute('height', '720')

  // Opaque ground, so the file is readable wherever it is opened.
  const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  background.setAttribute('width', '100%')
  background.setAttribute('height', '100%')
  background.setAttribute('fill', CHROME[mode].surface)
  clone.insertBefore(background, clone.firstChild)

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = EXPORT_STYLE
  clone.insertBefore(style, clone.firstChild)

  clone.querySelectorAll('.ring__hit').forEach((node) => node.remove())

  return new XMLSerializer().serializeToString(clone)
}

function save(href: string, filename: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function downloadSvg(svg: SVGSVGElement, mode: Mode) {
  const blob = new Blob([serialize(svg, mode)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  save(url, 'lead-score.svg')
  URL.revokeObjectURL(url)
}

export function downloadPng(svg: SVGSVGElement, mode: Mode) {
  const source = serialize(svg, mode)
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 1440
    canvas.height = 1440
    const context = canvas.getContext('2d')
    if (!context) return
    context.fillStyle = CHROME[mode].surface
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    save(canvas.toDataURL('image/png'), 'lead-score.png')
  }
  image.src = url
}
