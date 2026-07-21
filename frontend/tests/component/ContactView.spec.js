import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const isFeatureConfiguredMock = vi.fn(() => true)
vi.mock('@/utils/env', () => ({
  env: { web3formsAccessKey: 'test-key' },
  isFeatureConfigured: (...args) => isFeatureConfiguredMock(...args)
}))

const addMock = vi.fn()
vi.mock('@/services/web3formsMessageStore', () => ({
  web3formsMessageStore: { add: (...args) => addMock(...args) }
}))

const { default: ContactView } = await import('@/views/public/ContactView.vue')

function fillValidForm(wrapper) {
  return Promise.all([
    wrapper.find('#contact-name').setValue('Jane Doe'),
    wrapper.find('#contact-email').setValue('jane@example.com'),
    wrapper.find('#contact-subject').setValue('Hello'),
    wrapper.find('#contact-message').setValue('A message body')
  ])
}

describe('ContactView', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    isFeatureConfiguredMock.mockReturnValue(true)
    addMock.mockClear()
    global.fetch = vi.fn()
  })

  afterEach(() => { global.fetch = originalFetch })

  it('shows an unavailable message instead of the form when Web3Forms is not configured', () => {
    isFeatureConfiguredMock.mockReturnValue(false)
    const wrapper = mount(ContactView)
    expect(wrapper.text()).toContain('temporarily unavailable')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows field-level validation errors and does not call fetch on an empty submit', async () => {
    const wrapper = mount(ContactView)
    await wrapper.find('form').trigger('submit')

    expect(global.fetch).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Please enter your name.')
    expect(wrapper.text()).toContain('Please enter your email.')
  })

  it('rejects a malformed email with a specific message', async () => {
    const wrapper = mount(ContactView)
    await wrapper.find('#contact-email').setValue('not-an-email')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Please enter a valid email address.')
  })

  it('submits successfully, persists the message locally, and shows the success state', async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ success: true }) })
    const wrapper = mount(ContactView)
    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(addMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com' }))
    expect(wrapper.text()).toContain("Thanks, we'll be in touch.")
  })

  it('does not persist the message locally when Web3Forms reports failure', async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ success: false, message: 'Rejected' }) })
    const wrapper = mount(ContactView)
    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(addMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Rejected')
  })

  it('ignores a second submit fired while the first is still in flight (duplicate-submit guard)', async () => {
    let resolveFetch
    global.fetch.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve }))
    const wrapper = mount(ContactView)
    await fillValidForm(wrapper)

    wrapper.find('form').trigger('submit')
    wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    resolveFetch({ json: async () => ({ success: true }) })
    await flushPromises()
  })

  it('"Send another message" resets the form back to editable state', async () => {
    global.fetch.mockResolvedValue({ json: async () => ({ success: true }) })
    const wrapper = mount(ContactView)
    await fillValidForm(wrapper)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Once submitted, the form is unmounted (v-if="!submitted") — the only
    // button left in the DOM is "Send another message".
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#contact-name').element.value).toBe('')
  })
})
