import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import KitCarousel from '@/components/public/KitCarousel.vue'

function mountCarousel() {
  return mount(KitCarousel, {
    props: { ariaLabel: 'Featured STEM Kits' },
    slots: { default: '<div class="snap-start">Card 1</div><div class="snap-start">Card 2</div>' }
  })
}

// jsdom reports 0 for scrollWidth/clientWidth by default (no real layout), so
// tests that need a specific scroll position stub these directly on the
// track element rather than relying on real layout math.
function stubScrollGeometry(el, { scrollLeft = 0, scrollWidth = 1000, clientWidth = 300 }) {
  Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, configurable: true })
  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth, configurable: true })
  Object.defineProperty(el, 'clientWidth', { value: clientWidth, configurable: true })
}

describe('KitCarousel', () => {
  it('renders accessible previous/next controls with the requested group label', () => {
    const wrapper = mountCarousel()
    expect(wrapper.find('button[aria-label="Previous kits"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Next kits"]').exists()).toBe(true)
    expect(wrapper.find('[role="group"]').attributes('aria-label')).toBe('Featured STEM Kits')
  })

  it('disables the previous arrow at the start of the track', async () => {
    const wrapper = mountCarousel()
    const track = wrapper.find('[role="group"]').element
    stubScrollGeometry(track, { scrollLeft: 0, scrollWidth: 1000, clientWidth: 300 })
    track.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[aria-label="Previous kits"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[aria-label="Next kits"]').attributes('disabled')).toBeUndefined()
  })

  it('disables the next arrow at the end of the track', async () => {
    const wrapper = mountCarousel()
    const track = wrapper.find('[role="group"]').element
    stubScrollGeometry(track, { scrollLeft: 700, scrollWidth: 1000, clientWidth: 300 })
    track.dispatchEvent(new Event('scroll'))
    await wrapper.vm.$nextTick()
    expect(wrapper.find('button[aria-label="Next kits"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[aria-label="Previous kits"]').attributes('disabled')).toBeUndefined()
  })

  it('supports ArrowLeft/ArrowRight keyboard navigation on the track', async () => {
    const wrapper = mountCarousel()
    const track = wrapper.find('[role="group"]').element
    stubScrollGeometry(track, { scrollLeft: 0, scrollWidth: 1000, clientWidth: 300 })
    const scrollBySpy = vi.fn()
    track.scrollBy = scrollBySpy

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'ArrowRight' })
    expect(scrollBySpy).toHaveBeenCalledTimes(1)
    expect(scrollBySpy.mock.calls[0][0]).toMatchObject({ behavior: 'smooth' })
    expect(scrollBySpy.mock.calls[0][0].left).toBeGreaterThan(0)

    await wrapper.find('[role="group"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(scrollBySpy).toHaveBeenCalledTimes(2)
    expect(scrollBySpy.mock.calls[1][0].left).toBeLessThan(0)
  })

  it('the track is a real focusable element (tabindex=0), not just a decorative div', () => {
    const wrapper = mountCarousel()
    expect(wrapper.find('[role="group"]').attributes('tabindex')).toBe('0')
  })
})
