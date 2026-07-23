import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AvatarUploader from '@/components/portal/AvatarUploader.vue'

function makeFile({ name = 'photo.jpg', type = 'image/jpeg', size = 1024 } = {}) {
  const file = new File([new Uint8Array(size)], name, { type })
  return file
}

async function selectFile(wrapper, file) {
  const input = wrapper.find('input[type="file"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
}

describe('AvatarUploader', () => {
  it('shows initials fallback when no avatar is set', () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: '', displayName: 'Jane Doe' } })
    expect(wrapper.text()).toContain('JA')
    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('shows the avatar image when avatarUrl is set, with a Remove photo action', () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: 'data:image/jpeg;base64,xyz', displayName: 'Jane Doe' } })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.text()).toContain('Remove photo')
  })

  it('does not show Remove photo when there is no avatar', () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: '', displayName: 'Jane Doe' } })
    expect(wrapper.text()).not.toContain('Remove photo')
  })

  it('clicking Remove photo emits remove', async () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: 'data:image/jpeg;base64,xyz', displayName: 'Jane Doe' } })
    await wrapper.findAll('button').find((b) => b.text().includes('Remove photo')).trigger('click')
    expect(wrapper.emitted('remove')).toBeTruthy()
  })

  it('rejects an unsupported file type with an inline error and never emits change', async () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: '', displayName: 'Jane Doe' } })
    await selectFile(wrapper, makeFile({ type: 'application/pdf', name: 'doc.pdf' }))
    expect(wrapper.text()).toContain('JPG, PNG, or WebP')
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('rejects a file over the size limit with an inline error', async () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: '', displayName: 'Jane Doe' } })
    await selectFile(wrapper, makeFile({ size: 6 * 1024 * 1024 }))
    expect(wrapper.text()).toContain('5MB or smaller')
    expect(wrapper.emitted('change')).toBeFalsy()
  })

  it('the file input has an accessible label and accepts only image types', () => {
    const wrapper = mount(AvatarUploader, { props: { avatarUrl: '', displayName: 'Jane Doe' } })
    const input = wrapper.find('input[type="file"]')
    expect(input.attributes('accept')).toBe('image/jpeg,image/png,image/webp')
    const label = wrapper.find(`label[for="${input.attributes('id')}"]`)
    expect(label.exists()).toBe(true)
  })
})
