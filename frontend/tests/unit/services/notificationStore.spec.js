import { describe, it, expect } from 'vitest'
import { notificationStore } from '@/services/notificationStore'

describe('notificationStore', () => {
  it('returns an empty list for a user with no notifications', () => {
    expect(notificationStore.list('fresh-user')).toEqual([])
  })

  it('adds a notification, unread by default, most recent first', () => {
    notificationStore.add('user-1', { type: 'test', title: 'First', message: 'm1' })
    notificationStore.add('user-1', { type: 'test', title: 'Second', message: 'm2' })
    const list = notificationStore.list('user-1')
    expect(list.map((n) => n.title)).toEqual(['Second', 'First'])
    expect(list.every((n) => n.read === false)).toBe(true)
  })

  it('dedupes via dedupeKey — the same event never creates two entries', () => {
    notificationStore.add('user-2', { type: 'test', title: 'A', message: 'm', dedupeKey: 'evt-1' })
    notificationStore.add('user-2', { type: 'test', title: 'A again', message: 'm', dedupeKey: 'evt-1' })
    expect(notificationStore.list('user-2')).toHaveLength(1)
    expect(notificationStore.list('user-2')[0].title).toBe('A')
  })

  it('markRead marks only the targeted notification', () => {
    notificationStore.add('user-3', { type: 't', title: 'One', message: 'm' })
    notificationStore.add('user-3', { type: 't', title: 'Two', message: 'm' })
    const [second, first] = notificationStore.list('user-3')
    notificationStore.markRead('user-3', first.id)
    const updated = notificationStore.list('user-3')
    expect(updated.find((n) => n.id === first.id).read).toBe(true)
    expect(updated.find((n) => n.id === second.id).read).toBe(false)
  })

  it('markAllRead marks every notification read', () => {
    notificationStore.add('user-4', { type: 't', title: 'One', message: 'm' })
    notificationStore.add('user-4', { type: 't', title: 'Two', message: 'm' })
    notificationStore.markAllRead('user-4')
    expect(notificationStore.list('user-4').every((n) => n.read)).toBe(true)
  })

  it('remove dismisses a notification', () => {
    const list1 = notificationStore.add('user-5', { type: 't', title: 'One', message: 'm' })
    notificationStore.remove('user-5', list1[0].id)
    expect(notificationStore.list('user-5')).toEqual([])
  })

  it('keeps notifications independent per user', () => {
    notificationStore.add('user-a', { type: 't', title: 'A', message: 'm' })
    notificationStore.add('user-b', { type: 't', title: 'B', message: 'm' })
    expect(notificationStore.list('user-a').map((n) => n.title)).toEqual(['A'])
    expect(notificationStore.list('user-b').map((n) => n.title)).toEqual(['B'])
  })
})
