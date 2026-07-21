import { onMounted, onUnmounted } from 'vue'

const DEFAULT_TITLE = 'Yntra Sparks'

/**
 * Minimal per-route <title> + meta description management. No head library
 * is installed (vue-meta/@unhead/vue) — this covers the one thing the app
 * actually needs (SEO title/description on static content pages) without
 * adding a dependency for it.
 */
export function useDocumentHead(title, description) {
  let metaEl = null

  onMounted(() => {
    document.title = title ? `${title} · Yntra Sparks` : DEFAULT_TITLE

    if (description) {
      metaEl = document.querySelector('meta[name="description"]')
      if (!metaEl) {
        metaEl = document.createElement('meta')
        metaEl.setAttribute('name', 'description')
        document.head.appendChild(metaEl)
      }
      metaEl.setAttribute('content', description)
    }
  })

  onUnmounted(() => {
    document.title = DEFAULT_TITLE
  })
}
