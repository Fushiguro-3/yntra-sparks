import { describe, it, expect } from 'vitest'
import { savedKitsStore } from '@/services/savedKitsStore'

const kit = (id, title = `Kit ${id}`) => ({ id, title, thumbnailUrl: '', grade: 'Grade 5', categoryName: 'Robotics' })

describe('savedKitsStore', () => {
  it('returns an empty list for a user with no saved kits', () => {
    expect(savedKitsStore.list('fresh-user')).toEqual([])
    expect(savedKitsStore.isSaved('fresh-user', 1)).toBe(false)
  })

  it('saves a kit, most recent first', () => {
    savedKitsStore.save('user-1', kit(1))
    savedKitsStore.save('user-1', kit(2))
    expect(savedKitsStore.list('user-1').map((k) => k.id)).toEqual([2, 1])
  })

  it('prevents duplicate entries — saving the same kit twice moves it to the front, not duplicated', () => {
    savedKitsStore.save('user-2', kit(1))
    savedKitsStore.save('user-2', kit(2))
    savedKitsStore.save('user-2', kit(1))
    const list = savedKitsStore.list('user-2')
    expect(list.map((k) => k.id)).toEqual([1, 2])
    expect(list).toHaveLength(2)
  })

  it('isSaved reflects current state', () => {
    savedKitsStore.save('user-3', kit(5))
    expect(savedKitsStore.isSaved('user-3', 5)).toBe(true)
    expect(savedKitsStore.isSaved('user-3', 99)).toBe(false)
  })

  it('removes a saved kit', () => {
    savedKitsStore.save('user-4', kit(1))
    savedKitsStore.save('user-4', kit(2))
    savedKitsStore.remove('user-4', 1)
    expect(savedKitsStore.list('user-4').map((k) => k.id)).toEqual([2])
  })

  it('ignores a kit with no id', () => {
    savedKitsStore.save('user-5', { title: 'No id' })
    expect(savedKitsStore.list('user-5')).toEqual([])
  })

  it('keeps saved kits independent per user (no cross-user leakage)', () => {
    savedKitsStore.save('user-a', kit(1))
    savedKitsStore.save('user-b', kit(2))
    expect(savedKitsStore.list('user-a').map((k) => k.id)).toEqual([1])
    expect(savedKitsStore.list('user-b').map((k) => k.id)).toEqual([2])
  })

  it('denormalizes enough kit info to still render if the kit is later removed from the catalog', () => {
    savedKitsStore.save('user-6', kit(1, 'Chemistry Lab'))
    const [saved] = savedKitsStore.list('user-6')
    expect(saved.title).toBe('Chemistry Lab')
    expect(saved.categoryName).toBe('Robotics')
    expect(saved.savedAt).toEqual(expect.any(String))
  })
})
