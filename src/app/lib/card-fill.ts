export type PastelToken =
  | 'peach' | 'mint' | 'sky' | 'lilac' | 'butter' | 'blush'

export type Fill = {
  from: PastelToken
  to: PastelToken
  angle?: number
}

export function applyFill(el: HTMLElement, fill: Fill): void {
  const angle = fill.angle ?? 135
  el.style.setProperty('--grad-from', `var(--pastel-${fill.from})`)
  el.style.setProperty('--grad-to',   `var(--pastel-${fill.to})`)
  el.style.setProperty('--grad-bg',
    `linear-gradient(${angle}deg, var(--grad-from), var(--grad-to))`)
}
