<script setup>
const props = defineProps({
  status: { type: String, required: true }
})

const styles = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
  ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200'
}
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
    :class="styles[props.status] || 'bg-slate-100 text-slate-600 border-slate-200'"
  >
    {{ props.status.replaceAll('_', ' ') }}
  </span>
</template>
