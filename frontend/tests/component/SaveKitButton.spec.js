import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SaveKitButton from '@/components/portal/SaveKitButton.vue'
import { savedKitsStore } from '@/services/savedKitsStore'

const kit = (id, title = `Kit ${id}`) => ({ id, title, thumbnailUrl: '', grade: 'Grade 5', categoryName: 'Robotics' })

describe('SaveKitButton', () => {
  it('shows "Save kit" when not saved, with aria-pressed false', () => {
    const wrapper = mount(SaveKitButton, { props: { kit: kit(1), userId: 'save-user-1' } })
    expect(wrapper.text()).toContain('Save kit')
    expect(wrapper.attributes('aria-pressed')).toBe('false')
  })

  it('shows "Saved" and aria-pressed true when the kit is already saved', () => {
    savedKitsStore.save('save-user-2', kit(1))
    const wrapper = mount(SaveKitButton, { props: { kit: kit(1), userId: 'save-user-2' } })
    expect(wrapper.text()).toContain('Saved')
    expect(wrapper.attributes('aria-pressed')).toBe('true')
  })

  it('clicking toggles saved state and persists it', async () => {
    const wrapper = mount(SaveKitButton, { props: { kit: kit(1), userId: 'save-user-3' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Saved')
    expect(savedKitsStore.isSaved('save-user-3', 1)).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('Save kit')
    expect(savedKitsStore.isSaved('save-user-3', 1)).toBe(false)
  })

  it('does not propagate/navigate the click to a wrapping RouterLink', async () => {
    const wrapper = mount({
      components: { SaveKitButton },
      template: `<a href="#" @click="parentClicked = true"><SaveKitButton :kit="kit" user-id="save-user-4" /></a>`,
      data: () => ({ parentClicked: false, kit: kit(1) })
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.parentClicked).toBe(false)
  })

  it('keeps saved state isolated per user', async () => {
    const wrapperA = mount(SaveKitButton, { props: { kit: kit(2), userId: 'save-user-a' } })
    await wrapperA.find('button').trigger('click')
    const wrapperB = mount(SaveKitButton, { props: { kit: kit(2), userId: 'save-user-b' } })
    expect(wrapperB.attributes('aria-pressed')).toBe('false')
  })
})
