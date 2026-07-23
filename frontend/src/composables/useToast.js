import { reactive } from 'vue'

// Minimal global toast queue — module-level reactive state (not Pinia; this
// is transient UI feedback, not app state worth a store) shared by every
// caller of useToast() and rendered once by ToastContainer.vue in App.vue.
const toasts = reactive([])
let nextId = 1
const DEFAULT_DURATION = 4000

function dismiss(id) {
  const index = toasts.findIndex((t) => t.id === id)
  if (index !== -1) toasts.splice(index, 1)
}

function push(message, { type = 'success', duration = DEFAULT_DURATION } = {}) {
  const id = nextId++
  toasts.push({ id, message, type })
  if (duration > 0) {
    setTimeout(() => dismiss(id), duration)
  }
  return id
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message, opts) => push(message, { ...opts, type: 'success' }),
    error: (message, opts) => push(message, { ...opts, type: 'error' })
  }
}
