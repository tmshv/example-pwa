import { describe, it, expect, vi } from 'vitest'
import { readInsetsFromProbe, computeColorScheme } from '../src/lib/diagnostics'

describe('readInsetsFromProbe', () => {
  it('parses pixel paddings into integers', () => {
    const probe = document.createElement('div')
    probe.style.paddingTop = '20px'
    probe.style.paddingRight = '0px'
    probe.style.paddingBottom = '34px'
    probe.style.paddingLeft = '10px'
    document.body.appendChild(probe)

    const insets = readInsetsFromProbe(probe)
    expect(insets).toEqual({ top: 20, right: 0, bottom: 34, left: 10 })

    document.body.removeChild(probe)
  })
})

describe('computeColorScheme', () => {
  it('returns "dark" when prefers-color-scheme matches dark', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      matches: true,
    } as unknown as MediaQueryList))
    expect(computeColorScheme()).toBe('dark')
    spy.mockRestore()
  })

  it('returns "light" when prefers-color-scheme does not match dark', () => {
    const spy = vi.spyOn(window, 'matchMedia').mockImplementation(() => ({
      matches: false,
    } as unknown as MediaQueryList))
    expect(computeColorScheme()).toBe('light')
    spy.mockRestore()
  })
})
