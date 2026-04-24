import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { initInsets } from '../../src/core/lib/insets'

describe('initInsets', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('style')
    localStorage.clear()
    document.querySelectorAll('div').forEach((el) => el.remove())
    window.matchMedia = ((q: string) => ({
      matches: q.includes('portrait'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('writes CSS custom properties to <html> for all five inset/height vars', () => {
    initInsets()
    const style = document.documentElement.style
    expect(style.getPropertyValue('--sai-top')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--sai-right')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--sai-bottom')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--sai-left')).toMatch(/^\d+px$/)
    expect(style.getPropertyValue('--app-h')).toMatch(/^\d+px$/)
  })

  it('persists a snapshot under localStorage key "insets-v1" when standalone mode is active', () => {
    window.matchMedia = ((q: string) => ({
      matches: q.includes('standalone') || q.includes('portrait'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    initInsets()
    const raw = localStorage.getItem('insets-v1')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed).toHaveProperty('p')
    expect(parsed.p).toEqual(
      expect.objectContaining({
        t: expect.any(Number),
        r: expect.any(Number),
        b: expect.any(Number),
        l: expect.any(Number),
        h: expect.any(Number),
      }),
    )
  })

  it('does not decrease a cached inset when a later probe reads 0', () => {
    localStorage.setItem(
      'insets-v1',
      JSON.stringify({ p: { t: 44, r: 0, b: 34, l: 0, h: 800 } }),
    )
    window.matchMedia = ((q: string) => ({
      matches: q.includes('standalone') || q.includes('portrait'),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia

    initInsets()
    const raw = localStorage.getItem('insets-v1')!
    const parsed = JSON.parse(raw)
    expect(parsed.p.t).toBeGreaterThanOrEqual(44)
    expect(parsed.p.b).toBeGreaterThanOrEqual(34)
  })
})
