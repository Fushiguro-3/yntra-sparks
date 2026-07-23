import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const getKitMock = vi.fn()
vi.mock('@/api/publicService', () => ({
  publicService: { getKit: (...args) => getKitMock(...args) }
}))

const { default: KitDetailView } = await import('@/views/public/KitDetailView.vue')

const kitWithVideo = {
  id: 10,
  title: 'Circuit Explorers',
  categoryName: 'Electronics',
  grade: 'Grade 5',
  price: 999,
  description: 'Build circuits.',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  videos: [{ id: 1, title: 'Intro to Circuits', youtubeVideoId: 'dQw4w9WgXcQ' }]
}

const kitWithoutVideo = { ...kitWithVideo, videos: [], thumbnailUrl: '' }

async function mountAt(query = {}) {
  setActivePinia(createPinia())
  useAuthStore().isBootstrapping = false
  await router.push('/')
  await router.isReady()
  await router.push({ name: 'public-kit-detail', params: { id: '10' }, query })
  const wrapper = mount(KitDetailView, {
    props: { id: '10' },
    global: { plugins: [router] }
  })
  await flushPromises()
  return wrapper
}

describe('public KitDetailView — contextual back navigation', () => {
  beforeEach(() => {
    getKitMock.mockReset()
    getKitMock.mockResolvedValue(kitWithVideo)
  })

  it('Home → Kit shows "Back to Home"', async () => {
    const wrapper = await mountAt({ from: 'home' })
    const link = wrapper.findAll('a').find((a) => a.text().includes('Back to Home'))
    expect(link).toBeTruthy()
    expect(link.attributes('href')).toBe('/')
  })

  it('Grade → Kit shows "Back to Grade 5" and links back to that grade', async () => {
    const wrapper = await mountAt({ from: 'grade', value: 'Grade 5' })
    const link = wrapper.findAll('a').find((a) => a.text().includes('Back to Grade 5'))
    expect(link).toBeTruthy()
    expect(link.attributes('href')).toBe('/grades?grade=Grade+5')
  })

  it('Program → Kit shows "Back to Programs"', async () => {
    const wrapper = await mountAt({ from: 'program', value: 'Electronics' })
    const link = wrapper.findAll('a').find((a) => a.text().includes('Back to Programs'))
    expect(link).toBeTruthy()
  })

  it('Category → Kit shows the category name and links back to that category', async () => {
    const wrapper = await mountAt({ from: 'category', value: '3', label: 'Robotics' })
    const link = wrapper.findAll('a').find((a) => a.text().includes('Back to Robotics'))
    expect(link).toBeTruthy()
    expect(link.attributes('href')).toBe('/categories?category=3')
  })

  it('a direct link with no source context falls back to a safe "Back to Kits"', async () => {
    const wrapper = await mountAt()
    const link = wrapper.findAll('a').find((a) => a.text().includes('Back to Kits'))
    expect(link).toBeTruthy()
  })

  it('rejects an unrecognized/unsafe "from" value and falls back safely', async () => {
    const wrapper = await mountAt({ from: 'javascript:alert(1)', value: 'x' })
    const link = wrapper.findAll('a').find((a) => a.text().includes('Back to Kits'))
    expect(link).toBeTruthy()
  })
})

describe('public KitDetailView — Watch Demo behavior', () => {
  beforeEach(() => {
    getKitMock.mockReset()
  })

  it('shows a Watch Demo trigger when the kit has a video, and it opens a video modal (never navigates to Contact)', async () => {
    getKitMock.mockResolvedValue(kitWithVideo)
    const wrapper = await mountAt({ from: 'home' })

    const demoButton = wrapper.findAll('button').find((b) => b.text().includes('Watch Demo'))
    expect(demoButton).toBeTruthy()

    expect(wrapper.find('iframe').exists()).toBe(false)
    await demoButton.trigger('click')
    await flushPromises()

    const iframe = wrapper.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).toContain('youtube-nocookie.com')

    // Nothing labeled "Watch Demo" anywhere is a link to the Contact page.
    const contactLinks = wrapper.findAll('a').filter((a) => a.attributes('href') === '/contact')
    expect(contactLinks.every((a) => !a.text().includes('Watch Demo'))).toBe(true)
  })

  it('hides the Watch Demo control entirely when the kit has no video', async () => {
    getKitMock.mockResolvedValue(kitWithoutVideo)
    const wrapper = await mountAt({ from: 'home' })

    expect(wrapper.findAll('button').some((b) => b.text().includes('Watch Demo'))).toBe(false)
    expect(wrapper.text()).toContain('No video added yet.')
  })
})
