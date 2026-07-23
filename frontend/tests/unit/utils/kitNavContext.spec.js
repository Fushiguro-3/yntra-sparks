import { describe, it, expect } from 'vitest'
import { buildKitContext, resolveBackTarget, FALLBACK_TARGET } from '@/utils/kitNavContext'

describe('kitNavContext', () => {
  describe('buildKitContext', () => {
    it('builds a query for a known source with a value', () => {
      expect(buildKitContext('grade', 'Grade 5')).toEqual({ from: 'grade', value: 'Grade 5' })
    })

    it('includes a label when provided', () => {
      expect(buildKitContext('category', '7', 'Robotics')).toEqual({ from: 'category', value: '7', label: 'Robotics' })
    })

    it('returns an empty object for an unknown source', () => {
      expect(buildKitContext('bogus', 'x')).toEqual({})
    })

    it('omits value when not provided', () => {
      expect(buildKitContext('home')).toEqual({ from: 'home' })
    })
  })

  describe('resolveBackTarget', () => {
    it('resolves "home" to Back to Home', () => {
      expect(resolveBackTarget({ from: 'home' })).toEqual({
        label: 'Back to Home',
        to: { name: 'public-home' }
      })
    })

    it('resolves "grade" with a value to a grade-specific label and route', () => {
      expect(resolveBackTarget({ from: 'grade', value: 'Grade 5' })).toEqual({
        label: 'Back to Grade 5',
        to: { name: 'public-grades', query: { grade: 'Grade 5' } }
      })
    })

    it('resolves "program" to Back to Programs regardless of value', () => {
      expect(resolveBackTarget({ from: 'program', value: 'Robotics' })).toEqual({
        label: 'Back to Programs',
        to: { name: 'public-programs' }
      })
    })

    it('resolves "category" using the label when present', () => {
      expect(resolveBackTarget({ from: 'category', value: '3', label: 'Robotics' })).toEqual({
        label: 'Back to Robotics',
        to: { name: 'public-categories', query: { category: '3' } }
      })
    })

    it('resolves "categories" to a generic Back to Categories', () => {
      expect(resolveBackTarget({ from: 'categories' })).toEqual({
        label: 'Back to Categories',
        to: { name: 'public-categories' }
      })
    })

    it('falls back to a safe default when "from" is missing', () => {
      expect(resolveBackTarget({})).toEqual(FALLBACK_TARGET)
    })

    it('falls back to a safe default when "from" is not a recognized source', () => {
      expect(resolveBackTarget({ from: 'javascript:alert(1)' })).toEqual(FALLBACK_TARGET)
    })

    it('falls back when "grade" is missing its required value', () => {
      expect(resolveBackTarget({ from: 'grade' })).toEqual(FALLBACK_TARGET)
    })

    it('falls back when "category" is missing its required value', () => {
      expect(resolveBackTarget({ from: 'category' })).toEqual(FALLBACK_TARGET)
    })

    it('never trusts an oversized value as a route target', () => {
      const target = resolveBackTarget({ from: 'grade', value: 'x'.repeat(500) })
      expect(target).toEqual(FALLBACK_TARGET)
    })

    it('resolves "search" by reconstructing only whitelisted query keys', () => {
      expect(resolveBackTarget({ from: 'search', value: 'q=robot&grade=Grade+5&evil=1' })).toEqual({
        label: 'Back to Search',
        to: { name: 'public-search', query: { q: 'robot', grade: 'Grade 5' } }
      })
    })

    it('allows a longer value for "search" than the default 60-char cap (still bounded)', () => {
      const longQuery = `q=${'a'.repeat(200)}`
      const target = resolveBackTarget({ from: 'search', value: longQuery })
      expect(target.to.name).toBe('public-search')
      expect(target.to.query.q).toBe('a'.repeat(200))
    })

    it('degrades to a safe empty search (never an error) once the value exceeds even its larger cap', () => {
      const tooLong = `q=${'a'.repeat(400)}`
      const target = resolveBackTarget({ from: 'search', value: tooLong })
      // Still only ever the whitelisted public-search route — an oversized/
      // corrupted value just means an empty query, not an unsafe target.
      expect(target.to).toEqual({ name: 'public-search', query: {} })
    })
  })
})
