import { describe, it, expect } from 'vitest'
import { recentlyViewedStore } from '@/services/recentlyViewedStore'

const kit = (id, title = `Kit ${id}`) => ({ id, title, thumbnailUrl: '', grade: 'Grade 5', categoryName: 'Robotics' })

describe('recentlyViewedStore', () => {
  it('returns an empty list for a user with no history', () => {
    expect(recentlyViewedStore.list('fresh-user')).toEqual([])
  })

  it('records a view, most recent first', () => {
    recentlyViewedStore.record('user-1', kit(1))
    recentlyViewedStore.record('user-1', kit(2))
    const list = recentlyViewedStore.list('user-1')
    expect(list.map((k) => k.id)).toEqual([2, 1])
  })

  it('dedupes re-viewing the same kit, moving it back to the front', () => {
    recentlyViewedStore.record('user-2', kit(1))
    recentlyViewedStore.record('user-2', kit(2))
    recentlyViewedStore.record('user-2', kit(1))
    const list = recentlyViewedStore.list('user-2')
    expect(list.map((k) => k.id)).toEqual([1, 2])
  })

  it('caps history at 8 entries', () => {
    for (let i = 1; i <= 10; i++) recentlyViewedStore.record('user-3', kit(i))
    expect(recentlyViewedStore.list('user-3')).toHaveLength(8)
  })

  it('ignores a kit with no id', () => {
    recentlyViewedStore.record('user-4', { title: 'No id' })
    expect(recentlyViewedStore.list('user-4')).toEqual([])
  })

  it('clear() empties a user\'s history', () => {
    recentlyViewedStore.record('user-5', kit(1))
    recentlyViewedStore.clear('user-5')
    expect(recentlyViewedStore.list('user-5')).toEqual([])
  })

  it('keeps history independent per user', () => {
    recentlyViewedStore.record('user-a', kit(1))
    recentlyViewedStore.record('user-b', kit(2))
    expect(recentlyViewedStore.list('user-a').map((k) => k.id)).toEqual([1])
    expect(recentlyViewedStore.list('user-b').map((k) => k.id)).toEqual([2])
  })
})
