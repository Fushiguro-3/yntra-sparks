import { nextTick } from 'vue'

let observer = null
let mutationObserver = null
let refreshScheduled = false

export function initAos(router) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  function applyMotionPreference() {
    document.documentElement.classList.toggle('aos-reduced-motion', reducedMotion.matches)
  }
  applyMotionPreference()
  // Respond live if the user flips the OS setting without reloading, not
  // just on initial load.
  reducedMotion.addEventListener('change', applyMotionPreference)

  if (reducedMotion.matches) {
    // [data-aos].aos-reduced-motion is already opacity:1/no-transform via
    // CSS (style.css) — no need to run the IntersectionObserver machinery
    // at all for users who asked for reduced motion.
    return
  }

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
