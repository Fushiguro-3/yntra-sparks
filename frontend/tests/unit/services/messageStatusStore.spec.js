import { describe, it, expect } from 'vitest'
import { messageStatusStore } from '@/services/messageStatusStore'

describe('messageStatusStore', () => {
  it('defaults an unseen message id to unread (the migration story for legacy/first-seen messages)', () => {
    expect(messageStatusStore.getStatus('never-seen-before')).toBe('unread')
  })

  it('persists a status transition', () => {
    messageStatusStore.setStatus('msg-1', 'read')
    expect(messageStatusStore.getStatus('msg-1')).toBe('read')
  })

  it('supports the full read/unread/archived lifecycle', () => {
    messageStatusStore.setStatus('msg-2', 'read')
    expect(messageStatusStore.getStatus('msg-2')).toBe('read')
    messageStatusStore.setStatus('msg-2', 'unread')
    expect(messageStatusStore.getStatus('msg-2')).toBe('unread')
    messageStatusStore.setStatus('msg-2', 'archived')
    expect(messageStatusStore.getStatus('msg-2')).toBe('archived')
  })

  it('ignores an invalid status value, leaving the prior status intact', () => {
    messageStatusStore.setStatus('msg-3', 'read')
    messageStatusStore.setStatus('msg-3', 'bogus-status')
    expect(messageStatusStore.getStatus('msg-3')).toBe('read')
  })

  it('keeps statuses independent per message id', () => {
    messageStatusStore.setStatus('msg-a', 'archived')
    expect(messageStatusStore.getStatus('msg-b')).toBe('unread')
  })
})
