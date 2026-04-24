import { describe, it, expect } from 'vitest'
import { applyFill, type Fill } from '../src/app/lib/card-fill'

describe('applyFill', () => {
  it('sets --grad-from, --grad-to, --grad-bg on the element', () => {
    const el = document.createElement('div')
    const fill: Fill = { from: 'peach', to: 'mint' }
    applyFill(el, fill)
    expect(el.style.getPropertyValue('--grad-from')).toBe('var(--pastel-peach)')
    expect(el.style.getPropertyValue('--grad-to')).toBe('var(--pastel-mint)')
    expect(el.style.getPropertyValue('--grad-bg')).toBe(
      'linear-gradient(135deg, var(--grad-from), var(--grad-to))',
    )
  })

  it('uses the supplied angle when provided', () => {
    const el = document.createElement('div')
    applyFill(el, { from: 'sky', to: 'lilac', angle: 90 })
    expect(el.style.getPropertyValue('--grad-bg')).toBe(
      'linear-gradient(90deg, var(--grad-from), var(--grad-to))',
    )
  })
})
