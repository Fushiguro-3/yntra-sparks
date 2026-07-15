<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | outline | ghost
  size: { type: String, default: 'md' }, // sm | md | lg
  as: { type: String, default: 'button' },
  loading: { type: Boolean, default: false }
})

const sizeClasses = {
  sm: 'h-9 px-[18px] text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base'
}

const variantClasses = {
  primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-[0px_4px_12px_rgba(10,31,77,0.18)] hover:shadow-[0px_16px_32px_rgba(10,31,77,0.26)] mkt-btn-shine',
  secondary: 'bg-spark-500 text-white hover:bg-spark-600 shadow-[0px_4px_12px_rgba(242,101,34,0.2)] hover:shadow-[0px_16px_30px_rgba(242,101,34,0.3)] mkt-btn-shine',
  outline: 'bg-transparent text-navy-700 border-[1.5px] border-navy-700 hover:bg-navy-50 hover:border-navy-800',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-50'
}
</script>

<template>
  <component
    :is="as"
    class="relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-semibold
           transition-[transform,box-shadow,background-color,border-color] duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)]
           hover:-translate-y-0.5 hover:scale-[1.035]
           active:duration-[140ms] active:ease-[cubic-bezier(.7,0,.84,0)] active:scale-[0.965] active:translate-y-0
           disabled:opacity-40 disabled:pointer-events-none"
    :class="[sizeClasses[size], variantClasses[variant], { 'pointer-events-none opacity-80': loading }]"
    :disabled="loading"
    :aria-busy="loading"
  >
    <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
    <slot v-if="!loading" />
    <span v-else>Please wait…</span>
  </component>
</template>
