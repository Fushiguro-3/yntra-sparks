import { describe, it, expect } from 'vitest'
import { mockCategoryService } from '@/api/mock/mockCategoryService'
import { mockSchoolService } from '@/api/mock/mockSchoolService'
import { mockTeacherService } from '@/api/mock/mockTeacherService'
import { mockPrincipalService } from '@/api/mock/mockPrincipalService'
import { mockKitService } from '@/api/mock/mockKitService'

describe('mockCategoryService', () => {
  it('lists seeded categories', async () => {
    const categories = await mockCategoryService.list()
    expect(categories.length).toBeGreaterThan(0)
    expect(categories[0]).toHaveProperty('name')
  })

  it('creates, updates, and removes a category', async () => {
    const created = await mockCategoryService.create('Test Category')
    expect(created.name).toBe('Test Category')

    const updated = await mockCategoryService.update(created.id, 'Renamed Category')
    expect(updated.name).toBe('Renamed Category')

    await mockCategoryService.remove(created.id)
    const remaining = await mockCategoryService.list()
    expect(remaining.find((c) => c.id === created.id)).toBeUndefined()
  })

  it('throws a 404-shaped error updating a category that does not exist', async () => {
    await expect(mockCategoryService.update(999999, 'x')).rejects.toMatchObject({ status: 404 })
  })
})

describe('mockSchoolService', () => {
  it('paginates the school list with the Spring Page shape', async () => {
    const page = await mockSchoolService.list({ page: 0, size: 1 })
    expect(page).toHaveProperty('content')
    expect(page).toHaveProperty('totalElements')
    expect(page.content.length).toBeLessThanOrEqual(1)
  })

  it('creates a school defaulting to ACTIVE status', async () => {
    const school = await mockSchoolService.create({ name: 'New School', email: 'a@b.com', address: '' })
    expect(school.status).toBe('ACTIVE')
    expect(school.id).toBeDefined()
  })

  it('setStatus updates status in place', async () => {
    const school = await mockSchoolService.create({ name: 'Status School', email: 'c@d.com' })
    const updated = await mockSchoolService.setStatus(school.id, 'INACTIVE')
    expect(updated.status).toBe('INACTIVE')
  })
})

describe('mockTeacherService / mockPrincipalService (parallel admin-mediated account APIs)', () => {
  it('create returns a one-time temp password and adds an ACTIVE teacher', async () => {
    const { tempPassword } = await mockTeacherService.create(1, { name: 'T. Test', email: 't@test.com' })
    expect(tempPassword).toMatch(/^Temp@/)

    const page = await mockTeacherService.list(1)
    expect(page.content.some((t) => t.email === 't@test.com' && t.status === 'ACTIVE')).toBe(true)
  })

  it('deactivate then activate flips status both ways', async () => {
    const { } = await mockTeacherService.create(1, { name: 'Flip Test', email: 'flip@test.com' })
    const page = await mockTeacherService.list(1, { size: 100 })
    const teacher = page.content.find((t) => t.email === 'flip@test.com')

    await mockTeacherService.deactivate(1, teacher.id)
    let current = (await mockTeacherService.list(1, { size: 100 })).content.find((t) => t.id === teacher.id)
    expect(current.status).toBe('INACTIVE')

    await mockTeacherService.activate(1, teacher.id)
    current = (await mockTeacherService.list(1, { size: 100 })).content.find((t) => t.id === teacher.id)
    expect(current.status).toBe('ACTIVE')
  })

  it('principals: create returns a temp password scoped to the given school', async () => {
    const { tempPassword } = await mockPrincipalService.create(2, { name: 'P. Test', email: 'p@test.com' })
    expect(tempPassword).toMatch(/^Temp@/)
    const page = await mockPrincipalService.list(2)
    expect(page.content.some((p) => p.email === 'p@test.com')).toBe(true)
    // school 1's existing demo principal must not leak into school 2's list
    expect(page.content.some((p) => p.email === 'principal@dps.edu.in')).toBe(false)
  })
})

describe('mockKitService', () => {
  it('list only returns ACTIVE kits', async () => {
    const page = await mockKitService.list({ size: 100 })
    expect(page.content.every((k) => k.status === 'ACTIVE')).toBe(true)
  })

  it('listForMySchool scopes strictly to the given schoolId', async () => {
    const kit = await mockKitService.create({ title: 'Scoped Kit', description: '', categoryId: 1, grade: 'Grade 6', videos: [] })
    await mockKitService.assignToSchool(1, kit.id)

    const schoolOneKits = await mockKitService.listForMySchool({ size: 100 }, 1)
    const schoolTwoKits = await mockKitService.listForMySchool({ size: 100 }, 2)
    expect(schoolOneKits.content.some((k) => k.id === kit.id)).toBe(true)
    expect(schoolTwoKits.content.some((k) => k.id === kit.id)).toBe(false)
  })

  it('archive removes a kit from the active list without deleting it', async () => {
    const kit = await mockKitService.create({ title: 'Archive Me', description: '', categoryId: 1, grade: 'Grade 6', videos: [] })
    await mockKitService.archive(kit.id)

    const activeList = await mockKitService.list({ size: 100 })
    expect(activeList.content.some((k) => k.id === kit.id)).toBe(false)

    const direct = await mockKitService.getById(kit.id)
    expect(direct.status).toBe('ARCHIVED')
  })

  it('revokeFromSchool removes access previously granted by assignToSchool', async () => {
    const kit = await mockKitService.create({ title: 'Revoke Me', description: '', categoryId: 1, grade: 'Grade 6', videos: [] })
    await mockKitService.assignToSchool(3, kit.id)
    expect((await mockKitService.listForMySchool({ size: 100 }, 3)).content.some((k) => k.id === kit.id)).toBe(true)

    await mockKitService.revokeFromSchool(3, kit.id)
    expect((await mockKitService.listForMySchool({ size: 100 }, 3)).content.some((k) => k.id === kit.id)).toBe(false)
  })
})
