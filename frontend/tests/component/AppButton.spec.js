import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AppButton from '@/components/AppButton.vue'

describe('AppButton', () => {
  it('renders as a native <button> by default with the primary variant class', () => {
    const wrapper = mount(AppButton, { slots: { default: 'Save' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.classes()).toContain('app-button-primary')
    expect(wrapper.text()).toBe('Save')
  })

  it.each(['primary', 'secondary', 'outline', 'ghost', 'destructive'])('applies the app-button-%s class for that variant', (variant) => {
    const wrapper = mount(AppButton, { props: { variant }, slots: { default: 'X' } })
    expect(wrapper.classes()).toContain(`app-button-${variant}`)
  })

  it('disabled prevents click handlers from firing', async () => {
    let clicked = false
    const wrapper = mount(AppButton, {
      props: { disabled: true },
      attrs: { onClick: () => { clicked = true } },
      slots: { default: 'X' }
    })
    expect(wrapper.element.disabled).toBe(true)
    await wrapper.trigger('click')
    expect(clicked).toBe(false)
  })

  it('loading shows a spinner, sets aria-busy, and disables the button (guards against double-submit)', () => {
    const wrapper = mount(AppButton, { props: { loading: true }, slots: { default: 'Save' } })
    expect(wrapper.find('.btn-spinner').exists()).toBe(true)
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.element.disabled).toBe(true)
  })

  it('renders as a RouterLink when as="router-link", forwarding `to`', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div/>' } }, { path: '/admin', component: { template: '<div/>' } }]
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(AppButton, {
      props: { as: 'router-link', to: '/admin' },
      slots: { default: 'Go' },
      global: { plugins: [router] }
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/admin')
  })

  it('block applies the full-width class', () => {
    const wrapper = mount(AppButton, { props: { block: true }, slots: { default: 'X' } })
    expect(wrapper.classes()).toContain('app-button-block')
  })
})
