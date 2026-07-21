import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const isFeatureConfiguredMock = vi.fn(() => true)
vi.mock('@/utils/env', () => ({
  isFeatureConfigured: (...args) => isFeatureConfiguredMock(...args)
}))

const subscribeMock = vi.fn()
vi.mock('@/services/newsletterService', () => ({
  newsletterService: { subscribe: (...args) => subscribeMock(...args) }
}))

const hasMock = vi.fn(() => false)
const addMock = vi.fn()
vi.mock('@/services/newsletterSubscriberStore', () => ({
  newsletterSubscriberStore: {
    has: (...args) => hasMock(...args),
    add: (...args) => addMock(...args)
  }
}))

const { default: NewsletterForm } = await import('@/components/public/NewsletterForm.vue')

describe('NewsletterForm', () => {
  beforeEach(() => {
    isFeatureConfiguredMock.mockReturnValue(true)
    hasMock.mockReturnValue(false)
    subscribeMock.mockReset()
    addMock.mockClear()
  })

  it('shows an unavailable message instead of the form when Buttondown is not configured', () => {
    isFeatureConfiguredMock.mockReturnValue(false)
    const wrapper = mount(NewsletterForm)
    expect(wrapper.text()).toContain('temporarily unavailable')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('rejects an empty submit without calling the service', async () => {
    const wrapper = mount(NewsletterForm)
    await wrapper.find('form').trigger('submit')
    expect(subscribeMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Please enter your email.')
  })

  it('rejects a malformed email', async () => {
    const wrapper = mount(NewsletterForm)
    await wrapper.find('input#newsletter-email').setValue('not-an-email')
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Please enter a valid email address.')
  })

  it('shows "already subscribed" without hitting the network for a known email', async () => {
    hasMock.mockReturnValue(true)
    subscribeMock.mockResolvedValue()
    const wrapper = mount(NewsletterForm)
    await wrapper.find('input#newsletter-email').setValue('again@example.com')
    await wrapper.find('form').trigger('submit')

    expect(subscribeMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain("already on the list")
  })

  it('subscribes successfully, records the email locally, and shows the success state', async () => {
    subscribeMock.mockResolvedValue()
    const wrapper = mount(NewsletterForm)
    await wrapper.find('input#newsletter-email').setValue('reader@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(subscribeMock).toHaveBeenCalledWith('reader@example.com')
    expect(addMock).toHaveBeenCalledWith('reader@example.com')
    expect(wrapper.text()).toContain('Check your inbox to confirm')
  })

  it('shows an error state when the network request fails', async () => {
    subscribeMock.mockRejectedValue(new Error('offline'))
    const wrapper = mount(NewsletterForm)
    await wrapper.find('input#newsletter-email').setValue('reader@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Could not reach the newsletter service')
    expect(addMock).not.toHaveBeenCalled()
  })

  it('"Use a different email" resets back to the input form', async () => {
    subscribeMock.mockResolvedValue()
    const wrapper = mount(NewsletterForm)
    await wrapper.find('input#newsletter-email').setValue('reader@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('ignores a second submit fired while the first is still loading', async () => {
    let resolveSubscribe
    subscribeMock.mockReturnValue(new Promise((resolve) => { resolveSubscribe = resolve }))
    const wrapper = mount(NewsletterForm)
    await wrapper.find('input#newsletter-email').setValue('reader@example.com')

    wrapper.find('form').trigger('submit')
    wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(subscribeMock).toHaveBeenCalledTimes(1)
    resolveSubscribe()
    await flushPromises()
  })
})
