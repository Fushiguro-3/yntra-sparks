import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const listMock = vi.fn()
vi.mock('@/api/categoryService', () => ({
  categoryService: { list: (...args) => listMock(...args) }
}))

const listKitsMock = vi.fn()
vi.mock('@/api/publicService', () => ({
  publicService: { listKits: (...args) => listKitsMock(...args) }
}))

const { default: CategoriesView } = await import('@/views/public/CategoriesView.vue')

async function mountView() {
  const wrapper = mount(CategoriesView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('public CategoriesView', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    listMock.mockReset()
    listKitsMock.mockReset()
    listKitsMock.mockResolvedValue({ content: [] })
    await router.push({ name: 'public-categories' })
    await router.isReady()
  })

  it('shows a loading state before the category list resolves', () => {
    listMock.mockReturnValue(new Promise(() => {})) // never resolves
    const wrapper = mount(CategoriesView, { global: { plugins: [router] } })
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('renders real categories from categoryService once loaded, with an image per card, as real links', async () => {
    listMock.mockResolvedValue([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Robotics' }
    ])
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Electronics')
    expect(wrapper.text()).toContain('Robotics')
    const images = wrapper.findAll('img')
    expect(images).toHaveLength(2)
    images.forEach((img) => expect(img.attributes('src')).toBeTruthy())

    const cardLinks = wrapper.findAll('a').filter((a) => a.text().includes('Electronics') || a.text().includes('Robotics'))
    expect(cardLinks.length).toBe(2)
    expect(cardLinks[0].attributes('href')).toContain('/categories?category=')
  })

  it('shows an error state with a retry button on failure, and retry re-fetches', async () => {
    listMock.mockRejectedValueOnce({ message: 'Could not load categories.' })
    listMock.mockResolvedValueOnce([{ id: 1, name: 'Electronics' }])

    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Could not load categories.')
    const retryButton = wrapper.findAll('button').find((b) => b.text().includes('Try again'))
    expect(retryButton).toBeTruthy()

    await retryButton.trigger('click')
    await flushPromises()

    expect(listMock).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Electronics')
  })

  it('shows an empty state when there are no categories yet', async () => {
    listMock.mockResolvedValue([])
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No categories have been added yet')
  })

  it('filters kits by the selected category and links each kit to its detail page', async () => {
    listMock.mockResolvedValue([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Robotics' }
    ])
    listKitsMock.mockResolvedValue({
      content: [
        { id: 10, title: 'Circuit Explorers', categoryId: 1, categoryName: 'Electronics' },
        { id: 11, title: 'Robo Starter', categoryId: 2, categoryName: 'Robotics' }
      ]
    })

    await router.push({ name: 'public-categories', query: { category: '1' } })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Electronics')
    expect(wrapper.text()).toContain('Circuit Explorers')
    expect(wrapper.text()).not.toContain('Robo Starter')

    const kitLink = wrapper.findAll('a').find((a) => a.attributes('href') === '/kits/10?from=category&value=1&label=Electronics')
    expect(kitLink).toBeTruthy()
  })

  it('shows an empty state when the selected category has no kits', async () => {
    listMock.mockResolvedValue([{ id: 1, name: 'Electronics' }])
    listKitsMock.mockResolvedValue({ content: [] })

    await router.push({ name: 'public-categories', query: { category: '1' } })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('No kits are available in Electronics yet')
  })

  it('shows a "category not found" state with a back action for an unknown id, never a blank page', async () => {
    listMock.mockResolvedValue([{ id: 1, name: 'Electronics' }])
    listKitsMock.mockResolvedValue({ content: [] })

    await router.push({ name: 'public-categories', query: { category: '999' } })
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Category not found')
    const backButton = wrapper.findAll('button').find((b) => b.text().includes('Back to Categories'))
    expect(backButton).toBeTruthy()

    await backButton.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query.category).toBeUndefined()
  })
})
