import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const listMock = vi.fn()
vi.mock('@/api/categoryService', () => ({
  categoryService: { list: (...args) => listMock(...args) }
}))

const { default: CategoriesView } = await import('@/views/public/CategoriesView.vue')

describe('public CategoriesView', () => {
  beforeEach(() => {
    listMock.mockReset()
  })

  it('shows a loading state before the category list resolves', () => {
    listMock.mockReturnValue(new Promise(() => {})) // never resolves
    const wrapper = mount(CategoriesView)
    expect(wrapper.find('[role="status"]').exists()).toBe(true)
  })

  it('renders real categories from categoryService once loaded, with an image per card', async () => {
    listMock.mockResolvedValue([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Robotics' }
    ])
    const wrapper = mount(CategoriesView)
    await flushPromises()

    expect(wrapper.text()).toContain('Electronics')
    expect(wrapper.text()).toContain('Robotics')
    const images = wrapper.findAll('img')
    expect(images).toHaveLength(2)
    images.forEach((img) => expect(img.attributes('src')).toBeTruthy())
  })

  it('shows an error state with a retry button on failure, and retry re-fetches', async () => {
    listMock.mockRejectedValueOnce({ message: 'Could not load categories.' })
    listMock.mockResolvedValueOnce([{ id: 1, name: 'Electronics' }])

    const wrapper = mount(CategoriesView)
    await flushPromises()

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
    const wrapper = mount(CategoriesView)
    await flushPromises()

    expect(wrapper.text()).toContain('No categories have been added yet')
  })
})
