import { gsap } from 'gsap'

// Shared helper so every view that wants a GSAP entrance animation respects
// the same prefers-reduced-motion contract as the CSS-driven [data-aos]
// system in utils/aos.js.
export function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const PREMIUM_EASE = 'expo.out'

// Splits an element's text into word-level spans, each wrapped in an
// overflow-hidden mask, so the heading can rise up "into view" word by
// word rather than simply fading in as one block. Mutates the element's
// innerHTML once on mount — safe here because the hero heading is static
// marketing copy, not user content or reactive text.
function splitIntoMaskedWords(el) {
  if (!el || el.dataset.split === 'true') return []
  const words = el.textContent.trim().split(/\s+/)
  el.innerHTML = words
    .map((word) => `<span class="word-mask"><span class="word-inner">${word}</span></span>`)
    .join(' ')
  el.dataset.split = 'true'
  return Array.from(el.querySelectorAll('.word-inner'))
}

// Animates a hero block: heading reveals word-by-word with a masked rise,
// then the eyebrow/copy/CTA row follow in a soft staggered cascade — all
// transform/opacity only so it stays on the compositor thread. `heading`
// is optional and handled separately from `elements` so it can get the
// word-mask treatment instead of a flat fade.
// `elements` should be passed in the exact visual order they should appear
// (e.g. [eyebrow, paragraph, buttonRow]) — each one is given its own clear
// slot on the timeline rather than a tight overlapping stagger, so the
// hero reads as "heading... then copy... then buttons" instead of
// everything arriving in one fast burst.
export function heroReveal(elements = [], heading = null) {
  const targets = elements.filter(Boolean)
  const words = heading ? splitIntoMaskedWords(heading) : []

  if (!targets.length && !words.length) return null

  if (prefersReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0, scale: 1, clearProps: 'all' })
    if (words.length) gsap.set(words, { yPercent: 0, opacity: 1, clearProps: 'all' })
    return null
  }

  const tl = gsap.timeline({ defaults: { ease: PREMIUM_EASE } })

  // 1. Heading rises into view, word by word — still the first beat, but
  //    quick enough that the headline is legible almost immediately
  //    instead of assembling itself over a second-plus.
  if (words.length) {
    gsap.set(words, { yPercent: 140, opacity: 0 })

    tl.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.5,
      stagger: 0.035,
      ease: 'power3.out'
    }, 0)
  }

  // 2. Each remaining element (eyebrow/paragraph/buttons, in the order
  //    passed in) gets its own short slot right behind the previous one —
  //    a quick cascade, not a near-simultaneous group fade, but nowhere
  //    near the original ~2s runway.
  if (targets.length) {
    gsap.set(targets, { opacity: 0, y: 24, scale: 0.97 })

    const cascadeStart = words.length ? 0.28 : 0.05
    const slotGap = 0.1

    targets.forEach((el, i) => {
      tl.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out'
      }, cascadeStart + i * slotGap)
    })
  }

  return tl
}

// Scales + fades a single element in (typically the hero illustration/card)
// alongside heroReveal, offset slightly so it lands after the copy starts.
// A touch of rotation on the way in reads as more natural than a straight
// scale-up.
export function heroVisualReveal(el, delay = 0.45) {
  if (!el) return null

  if (prefersReducedMotion()) {
    gsap.set(el, { opacity: 1, scale: 1, rotate: 0, clearProps: 'all' })
    return null
  }

  gsap.set(el, { opacity: 0, scale: 0.92, y: 24, rotate: -3 })
  return gsap.to(el, {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    duration: 0.55,
    delay,
    ease: 'power3.out'
  })
}

// Attaches a subtle cursor-following tilt/parallax to an element while the
// pointer moves over `container` (defaults to the element itself). Purely
// transform-based, capped to a small range so it reads as a gentle premium
// "alive" response rather than a gimmicky 3D card. Returns a cleanup
// function; callers should invoke it in onUnmounted.
export function attachCursorParallax(el, { container = null, strength = 10 } = {}) {
  if (!el || typeof window === 'undefined') return () => {}
  if (prefersReducedMotion()) return () => {}

  const target = container || el
  let frame = null

  function handleMove(e) {
    const rect = target.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5

    if (frame) cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      gsap.to(el, {
        rotateY: relX * strength,
        rotateX: relY * -strength,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    })
  }

  function handleLeave() {
    if (frame) cancelAnimationFrame(frame)
    gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: PREMIUM_EASE, overwrite: 'auto' })
  }

  gsap.set(el, { transformPerspective: 900 })
  target.addEventListener('mousemove', handleMove)
  target.addEventListener('mouseleave', handleLeave)

  return () => {
    target.removeEventListener('mousemove', handleMove)
    target.removeEventListener('mouseleave', handleLeave)
    if (frame) cancelAnimationFrame(frame)
  }
}
