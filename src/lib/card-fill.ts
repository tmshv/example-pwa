export type PastelToken =
  | 'peach' | 'mint' | 'sky' | 'lilac' | 'butter' | 'blush'

export type GradientType =
  | 'linear-45'
  | 'linear-135'
  | 'linear-vertical'
  | 'linear-horizontal'
  | 'radial-tl'
  | 'radial-br'
  | 'radial-center'

export type CardFill = {
  gradient: GradientType
  from: PastelToken
  to: PastelToken
}

export const gradientAngles: Record<GradientType, string> = {
  'linear-45':         'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
  'linear-135':        'linear-gradient(45deg, var(--grad-from), var(--grad-to))',
  'linear-vertical':   'linear-gradient(180deg, var(--grad-from), var(--grad-to))',
  'linear-horizontal': 'linear-gradient(90deg, var(--grad-from), var(--grad-to))',
  'radial-tl':         'radial-gradient(at top left, var(--grad-from), var(--grad-to))',
  'radial-br':         'radial-gradient(at bottom right, var(--grad-from), var(--grad-to))',
  'radial-center':     'radial-gradient(at center, var(--grad-from), var(--grad-to))',
}

export function applyFill(el: HTMLElement, fill: CardFill): void {
  el.style.setProperty('--grad-from', `var(--pastel-${fill.from})`)
  el.style.setProperty('--grad-to',   `var(--pastel-${fill.to})`)
  el.style.setProperty('--grad-bg',   gradientAngles[fill.gradient])
}
