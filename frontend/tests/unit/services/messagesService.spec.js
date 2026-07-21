import { describe, it, expect, vi, beforeEach } from 'vitest'
import { web3formsMessageStore } from '@/services/web3formsMessageStore'

const listMock = vi.fn()
const deleteMock = vi.fn()

vi.mock('@/api/contactService', () => ({
  contactService: {
    list: (...args) => listMock(...args),
    delete: (...args) => deleteMock(...args)
  }
}))

// Imported after the mock so messagesService picks up the mocked contactService.
const { messagesService } = await import('@/services/messagesService')

describe('messagesService (merges backend + Web3Forms sources — see decisions.md ADR-011)', () => {
  beforeEach(() => {
    listMock.mockReset()
    deleteMock.mockReset()
    listMock.mockResolvedValue({
      content: [{ id: 1, name: 'Backend Sender', email: 'b@x.com', subject: 'From backend', createdAt: '2026-01-01T00:00:00' }],
      totalElements: 1
    })
  })

  it('merges backend and Web3Forms messages, sorted newest first, each tagged with its source', async () => {
    web3formsMessageStore.add({ name: 'Web Sender', email: 'w@x.com', subject: 'From web3forms', message: 'hi' })

    const page = await messagesService.list({ page: 0, size: 20 })

    expect(page.content).toHaveLength(2)
    expect(page.content[0].source).toBe('web3forms') // added just now, so it's newest
    expect(page.content[1].source).toBe('backend')
    expect(page.totalElements).toBe(2)
  })

  it('defaults a backend message without an explicit source field to "backend"', async () => {
    const page = await messagesService.list({})
    expect(page.content.find((m) => m.id === 1).source).toBe('backend')
  })

  it('delete() routes a web3forms-sourced message to local storage removal, not the backend', async () => {
    const entry = web3formsMessageStore.add({ name: 'X', email: 'x@x.com', subject: 'Delete me', message: 'hi' })
    await messagesService.delete({ id: entry.id, source: 'web3forms' })

    expect(deleteMock).not.toHaveBeenCalled()
    expect(web3formsMessageStore.getAll().find((m) => m.id === entry.id)).toBeUndefined()
  })

  it('delete() routes a backend-sourced message to contactService.delete', async () => {
    await messagesService.delete({ id: 1, source: 'backend' })
    expect(deleteMock).toHaveBeenCalledWith(1)
  })

  it('paginates the merged list client-side', async () => {
    for (let i = 0; i < 5; i++) {
      web3formsMessageStore.add({ name: `N${i}`, email: `n${i}@x.com`, subject: `S${i}`, message: 'hi' })
    }
    const page = await messagesService.list({ page: 0, size: 2 })
    expect(page.content).toHaveLength(2)
    expect(page.totalElements).toBe(6) // 5 web3forms + 1 backend
    expect(page.totalPages).toBe(3)
  })
})
