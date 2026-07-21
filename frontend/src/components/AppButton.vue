<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

// One button implementation for the whole app — see style.css's
// .app-button-* rules for the shared box model (height/padding/radius/
// font-weight/transition) every variant below reuses. Existing raw-Tailwind
// button markup across the admin/portal views is being migrated to this
// component incrementally; new buttons should always use it instead of
// hand-rolling another one-off style.
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'destructive'].includes(v)
  },
  size: { type: String, default: 'md', validator: (v) => ['sm', 'md', 'lg'].includes(v) },
  /** Renders as <button> (default), <RouterLink> ('router-link'), or <a> ('a'). */
  as: { type: String, default: 'button' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  /** Shows a spinner and blocks interaction — also guards against double-submit. */
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false }
})

const isDisabled = computed(() => props.disabled || props.loading)

const variantClass = computed(() => `app-button-${props.variant}`)

const sizeClass = computed(() => ({
  sm: 'text-xs px-3 py-1.5 min-h-[2.1rem]',
  md: '',
  lg: 'text-base px-6 py-3 min-h-[3rem]'
}[props.size]))
</script>

<template>
  <RouterLink
    v-if="as === 'router-link'"
    :to="to"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :tabindex="isDisabled ? '-1' : undefined"
    :class="[variantClass, sizeClass, { 'app-button-block': block }]"
    class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-500 focus-visible:ring-offset-2"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <slot />
  </RouterLink>
  <a
    v-else-if="as === 'a'"
    :href="href"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :tabindex="isDisabled ? '-1' : undefined"
    :class="[variantClass, sizeClass, { 'app-button-block': block }]"
    class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-500 focus-visible:ring-offset-2"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading ? 'true' : undefined"
    :class="[variantClass, sizeClass, { 'app-button-block': block }]"
    class="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-500 focus-visible:ring-offset-2"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>
