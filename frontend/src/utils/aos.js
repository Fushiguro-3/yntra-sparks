import { nextTick } from 'vue'

let observer = null
let mutationObserver = null
let refreshScheduled = false

export function initAos(router) {
 // Ignore reduced motion while developing.
// Uncomment the block below if you want to respect the user's OS preference.
//
// if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
//   document.documentElement.classList.add('aos-reduced-motion')
//   return
// }

document.documentElement.classList.remove('aos-reduced-motion')

  const refresh = () => {
    if (observer) observer.disconnect()

    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-visible')
          observer.unobserve(entry.target)
        }
      })
    }, {
      rootMargin: '0px 0px -30% 0px',
      threshold: 0.1
    })

    document.querySelectorAll('[data-aos]').forEach((el) => {
      if (!el.classList.contains('aos-visible')) {
        observer.observe(el)
      }
    })
  }

  const scheduleRefresh = () => {
    if (refreshScheduled) return
    refreshScheduled = true
    requestAnimationFrame(() => {
      refreshScheduled = false
      refresh()
    })
  }

  router.isReady().then(() => {
    requestAnimationFrame(refresh)
  })

  mutationObserver = new MutationObserver(scheduleRefresh)
  mutationObserver.observe(document.body, { childList: true, subtree: true })
  window.addEventListener('resize', scheduleRefresh)

  router.afterEach(async () => {
    await nextTick()
    scheduleRefresh()
  })
}
