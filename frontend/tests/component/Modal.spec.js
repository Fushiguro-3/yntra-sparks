import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Modal from '@/components/Modal.vue'

describe('Modal', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders nothing when show is false', () => {
    const wrapper = mount(Modal, { props: { show: false, title: 'X' } })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('emits close on Escape while open', async () => {
    const wrapper = mount(Modal, { props: { show: true, title: 'Edit' }, attachTo: document.body })
    await wrapper.vm.$nextTick()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('close')).toBeTruthy()
    wrapper.unmount()
  })

  it('emits close on backdrop click', async () => {
    const wrapper = mount(Modal, { props: { show: true, title: 'Edit' } })
    await wrapper.find('.absolute.inset-0.bg-navy-900\\/55').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('locks body scroll while open and releases it on close', async () => {
    const wrapper = mount(Modal, { props: { show: true, title: 'Edit' } })
    await wrapper.vm.$nextTick()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ show: false })
    await wrapper.vm.$nextTick()
    expect(document.body.style.overflow).toBe('')
  })

  it('moves focus into the dialog (close button) on open and restores it to the opener on close', async () => {
    const opener = document.createElement('button')
    opener.textContent = 'Open'
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const wrapper = mount(Modal, { props: { show: true, title: 'Edit' }, attachTo: document.body })
    await wrapper.vm.$nextTick()
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Close dialog')

    await wrapper.setProps({ show: false })
    await wrapper.vm.$nextTick()
    expect(document.activeElement).toBe(opener)

    wrapper.unmount()
    opener.remove()
  })
})
