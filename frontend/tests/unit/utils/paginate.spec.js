import { describe, it, expect } from 'vitest'
import { paginate } from '@/utils/paginate'

describe('paginate', () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1)

  it('slices the requested page and reports total counts', () => {
    const result = paginate(items, 0, 10)
    expect(result.content).toEqual(items.slice(0, 10))
    expect(result.totalElements).toBe(25)
    expect(result.totalPages).toBe(3)
  })

  it('returns the remainder on the last page', () => {
    const result = paginate(items, 2, 10)
    expect(result.content).toEqual(items.slice(20, 25))
    expect(result.content.length).toBe(5)
  })

  it('returns an empty content array past the last page', () => {
    const result = paginate(items, 10, 10)
    expect(result.content).toEqual([])
  })

  it('reports 1 total page for an empty array instead of 0', () => {
    const result = paginate([], 0, 10)
    expect(result.totalPages).toBe(1)
    expect(result.totalElements).toBe(0)
  })
})
