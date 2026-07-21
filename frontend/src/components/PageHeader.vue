<script setup>
// The "eyebrow / title / subtitle + primary action" header repeated at the
// top of every Super Admin, Principal, and Teacher page — extracted so
// that pattern only exists once instead of being hand-copied (with small
// drifting inconsistencies) into every view.
defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
    <div class="min-w-0">
      <p v-if="eyebrow" class="text-xs font-bold uppercase tracking-[.16em] text-spark-600 mb-1">{{ eyebrow }}</p>
      <h1 class="app-panel-title text-2xl">{{ title }}</h1>
      <p v-if="subtitle" class="text-ink-600 text-sm mt-1">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.default" class="flex items-center gap-2 flex-wrap">
      <slot />
    </div>
  </div>
</template>
