let observer = null
let mutationObserver = null
let refreshTimer = null

export function initAos(router) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('aos-reduced-motion')
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
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.12
    })

    document.querySelectorAll('[data-aos]').forEach((el) => {
      if (!el.classList.contains('aos-visible')) {
        observer.observe(el)
      }
    })
  }

  const scheduleRefresh = () => {
    clearTimeout(refreshTimer)
    refreshTimer = setTimeout(refresh, 60)
  }

  requestAnimationFrame(refresh)
  mutationObserver = new MutationObserver(scheduleRefresh)
  mutationObserver.observe(document.body, { childList: true, subtree: true })

  router.afterEach(() => {
    requestAnimationFrame(refresh)
  })
}
