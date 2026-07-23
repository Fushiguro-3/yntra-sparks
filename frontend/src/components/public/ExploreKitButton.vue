<script setup>
// The one standardized "Explore Kit" CTA — adopts the Programs page's
// app-button-primary pill as the canonical look (label, size, height,
// padding, radius, weight, icon, hover/focus state) so Grades, Programs,
// Categories, and every kit card share exactly one button instead of each
// page hand-rolling its own.
defineProps({
  to: { type: [Object, String], required: true },
  size: { type: String, default: 'md' }, // sm | md
  block: { type: Boolean, default: false }
})

const sizeClasses = {
  sm: 'text-xs px-3.5 min-h-[2.25rem]',
  md: ''
}
</script>

<template>
  <RouterLink
    :to="to"
    class="app-button-primary"
    :class="[sizeClasses[size], { 'app-button-block': block }]"
  >
    <slot>Explore Kit</slot>
    <span aria-hidden="true">&rarr;</span>
  </RouterLink>
</template>
