import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoModal from '@/components/VideoModal.vue'

describe('VideoModal', () => {
  it('renders a privacy-enhanced YouTube embed with a meaningful title when a valid video id is given', () => {
    const wrapper = mount(VideoModal, {
      props: { show: true, videoId: 'dQw4w9WgXcQ', title: 'Circuit Explorers demo' }
    })
    const iframe = wrapper.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
    expect(iframe.attributes('title')).toBe('Circuit Explorers demo')
    expect(iframe.attributes('allow')).not.toContain('autoplay')
  })

  it('does not render an iframe when no video id is given', () => {
    const wrapper = mount(VideoModal, { props: { show: true, videoId: '', title: 'No video' } })
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.text()).toContain("isn't available")
  })

  it('does not render an iframe for a malformed video id', () => {
    const wrapper = mount(VideoModal, {
      props: { show: true, videoId: '<script>alert(1)</script>', title: 'Bad id' }
    })
    expect(wrapper.find('iframe').exists()).toBe(false)
  })

  it('renders nothing while closed (Modal unmounts its content)', () => {
    const wrapper = mount(VideoModal, { props: { show: false, videoId: 'dQw4w9WgXcQ', title: 'Closed' } })
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('emits close when Escape is pressed while open', async () => {
    const wrapper = mount(VideoModal, {
      props: { show: true, videoId: 'dQw4w9WgXcQ', title: 'Escape test' }
    })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
