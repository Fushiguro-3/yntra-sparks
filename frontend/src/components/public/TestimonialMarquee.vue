<script setup>
import { computed } from 'vue'
import TestimonialCard from './TestimonialCard.vue'

const props = defineProps({
  testimonials: { type: Array, required: true }
})

// Each row is tripled so the -33.333% keyframe (style.css) always has two
// full extra copies queued up behind the visible one — the loop resets
// exactly when the first copy has scrolled fully out, so there's never a
// visible seam or a blank gap at the reset point. Row two reuses the same
// content in reverse order (purely cosmetic variety — three testimonials
// isn't enough content to justify two genuinely different sets) and moves
// in the opposite direction via `.testimonial-row--reverse` (animation-direction:
// reverse on the identical keyframe, rather than a second keyframe to maintain).
const rowOne = computed(() => tripled(props.testimonials))
const rowTwo = computed(() => tripled([...props.testimonials].reverse()))

function tripled(list) {
  return [...list, ...list, ...list].map((t, i) => ({
    ...t,
    // Only the first copy is "real" — the other two exist purely so the
    // CSS animation has content to scroll into view. Screen readers should
    // never see the duplicates announced as if there were 9 testimonials.
    duplicate: i >= list.length
  }))
}
</script>

<template>
  <div class="testimonial-marquee" role="region" aria-label="What schools are saying">
    <div class="testimonial-row">
      <div class="testimonial-row__track">
        <TestimonialCard
          v-for="(t, i) in rowOne"
          :key="`row1-${t.name}-${i}`"
          :quote="t.quote"
          :name="t.name"
          :role="t.role"
          :initials="t.initials"
          :aria-hidden="t.duplicate ? 'true' : null"
          :tabindex="t.duplicate ? '-1' : '0'"
          class="w-[300px] sm:w-[380px] shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-spark-500 focus-visible:ring-offset-2 rounded-[20px]"
        />
      </div>
    </div>
    <div class="testimonial-row testimonial-row--reverse" aria-hidden="true">
      <div class="testimonial-row__track">
        <TestimonialCard
          v-for="(t, i) in rowTwo"
          :key="`row2-${t.name}-${i}`"
          :quote="t.quote"
          :name="t.name"
          :role="t.role"
          :initials="t.initials"
          aria-hidden="true"
          tabindex="-1"
          class="w-[300px] sm:w-[380px] shrink-0"
        />
      </div>
    </div>
  </div>
</template>
