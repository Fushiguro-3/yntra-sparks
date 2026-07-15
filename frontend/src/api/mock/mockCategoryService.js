import { categoriesData } from '@/data/categories'
import { fakeDelay, nextMockId } from './mockHelpers'

let categories = categoriesData.map((c) => ({ ...c }))

export const mockCategoryService = {
  async list() {
    await fakeDelay()
    return [...categories]
  },

  async create(name) {
    await fakeDelay()
    const category = { id: nextMockId(), name, createdAt: new Date().toISOString() }
    categories.push(category)
    return category
  },

  async update(id, name) {
    await fakeDelay()
    const category = categories.find((c) => c.id === Number(id))
    if (!category) throw { message: 'Category not found', status: 404 }
    category.name = name
    return category
  },

  async remove(id) {
    await fakeDelay()
    const index = categories.findIndex((c) => c.id === Number(id))
    if (index === -1) throw { message: 'Category not found', status: 404 }
    categories.splice(index, 1)
  }
}
