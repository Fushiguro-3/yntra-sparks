<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | outline | ghost
  size: { type: String, default: 'md' }, // sm | md | lg
  as: { type: String, default: 'button' }
})

const sizeClasses = {
  sm: 'h-9 px-[18px] text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base'
}

const variantClasses = {
  primary: 'bg-navy-800 text-white hover:bg-navy-900 shadow-[0px_4px_12px_rgba(10,31,77,0.18)] hover:shadow-[0px_12px_28px_rgba(10,31,77,0.22)]',
  secondary: 'bg-spark-500 text-white hover:bg-spark-600',
  outline: 'bg-transparent text-navy-700 border-[1.5px] border-navy-700 hover:bg-navy-50',
  ghost: 'bg-transparent text-navy-700 hover:bg-navy-50'
}
</script>

<template>
  <component
    :is="as"
    class="inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
    :class="[sizeClasses[size], variantClasses[variant]]"
  >
    <slot />
  </component>
</template>
