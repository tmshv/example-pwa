import { describe, it, expect } from 'vitest'
import { gradientAngles, applyFill, type CardFill } from '../src/lib/card-fill'

describe('gradientAngles', () => {
  it('returns a linear gradient for linear-45', () => {
    expect(gradientAngles['linear-45']).toBe(
      'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
    )
  })

  it('returns a radial gradient for radial-tl', () => {
    expect(gradientAngles['radial-tl']).toBe(
      'radial-gradient(at top left, var(--grad-from), var(--grad-to))',
    )
  })

  it('covers every GradientType', () => {
    const keys = Object.keys(gradientAngles).sort()
    expect(keys).toEqual([
      'linear-135',
      'linear-45',
      'linear-horizontal',
      'linear-vertical',
      'radial-br',
      'radial-center',
      'radial-tl',
    ])
  })
})

describe('applyFill', () => {
  it('sets --grad-from, --grad-to, --grad-bg on the element', () => {
    const el = document.createElement('div')
    const fill: CardFill = { gradient: 'linear-vertical', from: 'peach', to: 'mint' }
    applyFill(el, fill)
    expect(el.style.getPropertyValue('--grad-from')).toBe('var(--pastel-peach)')
    expect(el.style.getPropertyValue('--grad-to')).toBe('var(--pastel-mint)')
    expect(el.style.getPropertyValue('--grad-bg')).toBe(
      'linear-gradient(180deg, var(--grad-from), var(--grad-to))',
    )
  })

  it('uses radial template for radial fills', () => {
    const el = document.createElement('div')
    applyFill(el, { gradient: 'radial-br', from: 'sky', to: 'lilac' })
    expect(el.style.getPropertyValue('--grad-bg')).toBe(
      'radial-gradient(at bottom right, var(--grad-from), var(--grad-to))',
    )
  })
})
