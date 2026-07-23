import { reactive } from 'vue'

// Promise-based confirm(), replacing raw window.confirm() across the
// portals with something styled/consistent and accessible (built on
// Modal.vue's existing focus-trap/Escape/backdrop behaviour via
// ConfirmDialog.vue, mounted once in App.vue).
const state = reactive({
  show: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false
})
let resolver = null

function settle(value) {
  state.show = false
  const resolve = resolver
  resolver = null
  resolve?.(value)
}

/** @returns {Promise<boolean>} true if confirmed, false if cancelled/dismissed */
function confirmAction({ title = 'Are you sure?', message = '', confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) {
  // A second confirm() call while one is open resolves the first as
  // cancelled rather than leaving its promise dangling forever.
  if (resolver) settle(false)
  state.title = title
  state.message = message
  state.confirmLabel = confirmLabel
  state.cancelLabel = cancelLabel
  state.danger = danger
  state.show = true
  return new Promise((resolve) => { resolver = resolve })
}

export function useConfirm() {
  return {
    confirmState: state,
    confirm: confirmAction,
    accept: () => settle(true),
    decline: () => settle(false)
  }
}
