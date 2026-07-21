import { describe, it, expect } from 'vitest'
import { resolveScrollTarget, HASH_SCROLL_OFFSET } from '@/router'

describe('resolveScrollTarget (router scroll restoration)', () => {
  it('prefers the browser-saved position on Back/Forward over everything else', () => {
    const saved = { left: 0, top: 842 }
    const result = resolveScrollTarget(
      { path: '/about', hash: '' },
      { path: '/' },
      saved
    )
    expect(result).toBe(saved)
  })

  it('scrolls to the hash target with the sticky-header offset when there is a hash and no saved position', () => {
    const result = resolveScrollTarget(
      { path: '/about', hash: '#our-story' },
      { path: '/' },
      null
    )
    expect(result).toEqual({ el: '#our-story', top: HASH_SCROLL_OFFSET, behavior: 'smooth' })
  })

  it('does not scroll (returns false) when only the query changes on the same path', () => {
    const result = resolveScrollTarget(
      { path: '/admin/schools', hash: '', query: { page: '2' } },
      { path: '/admin/schools', query: { page: '1' } },
      null
    )
    expect(result).toBe(false)
  })

  it('scrolls to top for a genuine new-route navigation', () => {
    const result = resolveScrollTarget(
      { path: '/about', hash: '' },
      { path: '/' },
      null
    )
    expect(result).toEqual({ top: 0 })
  })
})
