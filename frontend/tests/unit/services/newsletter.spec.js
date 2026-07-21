import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { newsletterSubscriberStore } from '@/services/newsletterSubscriberStore'
import { newsletterService } from '@/services/newsletterService'

describe('newsletterSubscriberStore', () => {
  it('has() is false for an email never added', () => {
    expect(newsletterSubscriberStore.has('nobody@example.com')).toBe(false)
  })

  it('add() then has() recognizes the email case-insensitively and trims whitespace', () => {
    newsletterSubscriberStore.add('  Someone@Example.com  ')
    expect(newsletterSubscriberStore.has('someone@example.com')).toBe(true)
    expect(newsletterSubscriberStore.has('SOMEONE@EXAMPLE.COM')).toBe(true)
  })

  it('add() is idempotent for the same normalized email', () => {
    newsletterSubscriberStore.add('dup@example.com')
    newsletterSubscriberStore.add('dup@example.com')
    newsletterSubscriberStore.add('DUP@example.com')
    // No assertion on internal storage shape — just that repeated adds
    // don't throw and the email is still recognized.
    expect(newsletterSubscriberStore.has('dup@example.com')).toBe(true)
  })
})

describe('newsletterService.subscribe', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({}) // no-cors responses are opaque
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('POSTs to the Buttondown embed-subscribe endpoint with mode: no-cors', async () => {
    await newsletterService.subscribe('reader@example.com')

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [url, options] = global.fetch.mock.calls[0]
    expect(url).toContain('buttondown.com/api/emails/embed-subscribe/')
    expect(options.method).toBe('POST')
    expect(options.mode).toBe('no-cors')
    expect(options.body.toString()).toContain('email=reader%40example.com')
  })

  it('rejects when the network request itself fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    await expect(newsletterService.subscribe('reader@example.com')).rejects.toThrow('offline')
  })
})
