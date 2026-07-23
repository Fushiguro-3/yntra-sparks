import { describe, it, expect } from 'vitest'
import { profileStore } from '@/services/profileStore'

describe('profileStore', () => {
  it('returns an empty object for a user with no saved overlay', () => {
    expect(profileStore.get('user-with-no-data')).toEqual({})
  })

  it('persists and returns editable fields', () => {
    profileStore.update('user-1', { displayName: 'Jane Doe', phone: '123', avatarUrl: 'https://x/y.png' })
    expect(profileStore.get('user-1')).toMatchObject({ displayName: 'Jane Doe', phone: '123', avatarUrl: 'https://x/y.png' })
  })

  it('stamps updatedAt on every update', () => {
    profileStore.update('user-1b', { displayName: 'Jane Doe' })
    expect(profileStore.get('user-1b').updatedAt).toEqual(expect.any(String))
  })

  it('merges partial updates instead of overwriting the whole overlay', () => {
    profileStore.update('user-2', { displayName: 'Jane Doe' })
    profileStore.update('user-2', { phone: '456' })
    expect(profileStore.get('user-2')).toMatchObject({ displayName: 'Jane Doe', phone: '456' })
  })

  it('silently drops fields that are not on the editable allow-list', () => {
    profileStore.update('user-3', { role: 'SUPER_ADMIN', schoolId: 999, displayName: 'Ok Name' })
    const overlay = profileStore.get('user-3')
    expect(overlay.displayName).toBe('Ok Name')
    expect(overlay.role).toBeUndefined()
    expect(overlay.schoolId).toBeUndefined()
  })

  it('keeps overlays for different users independent', () => {
    profileStore.update('user-a', { displayName: 'A' })
    profileStore.update('user-b', { displayName: 'B' })
    expect(profileStore.get('user-a').displayName).toBe('A')
    expect(profileStore.get('user-b').displayName).toBe('B')
  })
})
