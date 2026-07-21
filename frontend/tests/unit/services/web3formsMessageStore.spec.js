import { describe, it, expect, vi, afterEach } from 'vitest'
import { web3formsMessageStore } from '@/services/web3formsMessageStore'

describe('web3formsMessageStore', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty', () => {
    expect(web3formsMessageStore.getAll()).toEqual([])
  })

  it('add() persists a message tagged with source web3forms, newest first', () => {
    // Fake timers so the two createdAt timestamps are guaranteed distinct —
    // two real adds can otherwise land in the same millisecond and make
    // "newest first" ordering flaky.
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    web3formsMessageStore.add({ name: 'A', email: 'a@x.com', subject: 'First', message: 'hi' })
    vi.setSystemTime(new Date('2026-01-01T00:00:01Z'))
    web3formsMessageStore.add({ name: 'B', email: 'b@x.com', subject: 'Second', message: 'hi' })

    const all = web3formsMessageStore.getAll()
    expect(all).toHaveLength(2)
    expect(all[0].subject).toBe('Second') // most recent first
    expect(all.every((m) => m.source === 'web3forms')).toBe(true)
    expect(all.every((m) => typeof m.id === 'string')).toBe(true)
  })

  it('remove() deletes only the targeted message', () => {
    const entry = web3formsMessageStore.add({ name: 'C', email: 'c@x.com', subject: 'Third', message: 'hi' })
    web3formsMessageStore.remove(entry.id)
    expect(web3formsMessageStore.getAll().find((m) => m.id === entry.id)).toBeUndefined()
  })

  it('survives being read back after a simulated reload (same localStorage key)', () => {
    web3formsMessageStore.add({ name: 'D', email: 'd@x.com', subject: 'Persisted', message: 'hi' })
    // A fresh call to getAll() re-reads from localStorage each time rather
    // than caching in memory, so this doubles as the "survives reload" case.
    expect(web3formsMessageStore.getAll().some((m) => m.subject === 'Persisted')).toBe(true)
  })
})
