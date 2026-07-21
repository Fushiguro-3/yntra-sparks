import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TestimonialMarquee from '@/components/public/TestimonialMarquee.vue'

const testimonials = [
  { quote: 'A', name: 'Alice', role: 'Principal', initials: 'A' },
  { quote: 'B', name: 'Bob', role: 'Teacher', initials: 'B' },
  { quote: 'C', name: 'Carol', role: 'Coordinator', initials: 'C' }
]

describe('TestimonialMarquee', () => {
  it('renders two rows, the second marked with the reverse-direction modifier class', () => {
    const wrapper = mount(TestimonialMarquee, { props: { testimonials } })
    const rows = wrapper.findAll('.testimonial-row')
    expect(rows).toHaveLength(2)
    expect(rows[0].classes()).not.toContain('testimonial-row--reverse')
    expect(rows[1].classes()).toContain('testimonial-row--reverse')
  })

  it('triples each row\'s content for a seamless loop, but only the first copy is in accessible reading order', () => {
    const wrapper = mount(TestimonialMarquee, { props: { testimonials } })
    const rows = wrapper.findAll('.testimonial-row')
    const rowOneCards = rows[0].findAll('.testimonial-card')
    expect(rowOneCards).toHaveLength(9) // 3 testimonials x 3 copies

    const hidden = rowOneCards.filter((c) => c.attributes('aria-hidden') === 'true')
    const visible = rowOneCards.filter((c) => c.attributes('aria-hidden') !== 'true')
    expect(hidden).toHaveLength(6) // the 2 duplicate copies
    expect(visible).toHaveLength(3) // the "real" copy screen readers should see
  })

  it('makes the real (non-duplicate) row-one cards keyboard-focusable so users can pause the marquee', () => {
    const wrapper = mount(TestimonialMarquee, { props: { testimonials } })
    const rowOneCards = wrapper.findAll('.testimonial-row')[0].findAll('.testimonial-card')
    const real = rowOneCards.filter((c) => c.attributes('aria-hidden') !== 'true')
    real.forEach((c) => expect(c.attributes('tabindex')).toBe('0'))

    const duplicates = rowOneCards.filter((c) => c.attributes('aria-hidden') === 'true')
    duplicates.forEach((c) => expect(c.attributes('tabindex')).toBe('-1'))
  })

  it('hides the entire second (reversed, cosmetic-duplicate) row from assistive tech', () => {
    const wrapper = mount(TestimonialMarquee, { props: { testimonials } })
    const rowTwoWrapper = wrapper.findAll('.testimonial-row')[1]
    expect(rowTwoWrapper.attributes('aria-hidden')).toBe('true')
  })

  it('row region is labeled for assistive tech', () => {
    const wrapper = mount(TestimonialMarquee, { props: { testimonials } })
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-label')).toBeTruthy()
  })
})
