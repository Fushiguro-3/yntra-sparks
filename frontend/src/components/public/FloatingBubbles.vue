<script setup>
// Purely decorative, ambient background motion. Every bubble only animates
// transform + opacity (see .bubble keyframes in style.css) so this stays
// smooth at 60fps and costs nothing during layout/paint. Sits behind page
// content (z-index 0, pointer-events none) and is skipped entirely under
// prefers-reduced-motion via the CSS media query in style.css.
//
// On top of the base bubble-loop-N keyframes, each bubble is given its own
// randomized drift speed, delay, resting scale and opacity multiplier on
// mount — computed once, not shared presets — so the field never reads as
// the same handful of shapes breathing in a fixed pattern. The outer
// .bubble-wrap holds the random static scale/opacity, the inner .bubble
// keeps doing the keyframe drift/rotate/opacity-pulse from style.css, so
// the two compose into motion that looks genuinely alive rather than a
// single fixed loop.
const props = defineProps({
  // 'soft' = quieter, fewer/smaller bubbles (good for form/login screens)
  // 'full' = the livelier hero treatment
  density: { type: String, default: 'full' }
})

const bubbleIds = ['a', 'b', 'c', 'i', 'd', 'e', 'f', 'g', 'h']
const fullOnly = new Set(['d', 'e', 'f', 'g', 'h'])

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

// Randomized once per component instance (i.e. once per page mount), not
// per render — the field settles into its own drift pattern for the
// lifetime of the page rather than re-randomizing on every reactive tick.
const bubbleRandomness = Object.fromEntries(
  bubbleIds.map((id) => [
    id,
    {
      scale: randomBetween(0.75, 1.35).toFixed(3),
      opacity: randomBetween(0.55, 1).toFixed(3),
      speedFactor: randomBetween(0.72, 1.35).toFixed(3),
      delay: randomBetween(0, 4).toFixed(2)
    }
  ])
)

function wrapStyle(id) {
  const r = bubbleRandomness[id]
  return {
    transform: `scale(${r.scale})`,
    opacity: r.opacity
  }
}

// Base loop durations, one per bubble — matches the "feel" tuned in the
// original bubble-a..i rules in style.css. The randomized speedFactor
// above then stretches/compresses each of these per mount.
const baseDurations = {
  a: 12, b: 15.5, c: 18, d: 13.5, e: 10.5, f: 16.5, g: 9.5, h: 17, i: 8.5
}

function innerStyle(id) {
  const r = bubbleRandomness[id]
  const duration = (baseDurations[id] * Number(r.speedFactor)).toFixed(2)
  return {
    animationDuration: `${duration}s`,
    animationDelay: `${r.delay}s`
  }
}

const visibleBubbles = bubbleIds.filter((id) => props.density === 'full' || !fullOnly.has(id))
</script>

<template>
  <div class="bubble-field" aria-hidden="true">
    <span
      v-for="id in visibleBubbles"
      :key="id"
      class="bubble-wrap"
      :class="`bubble-wrap-${id}`"
      :style="wrapStyle(id)"
    >
      <span class="bubble" :class="`bubble-${id}`" :style="innerStyle(id)"></span>
    </span>
  </div>
</template>
