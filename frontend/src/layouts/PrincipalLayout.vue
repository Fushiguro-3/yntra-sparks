<script setup>
import PortalShell from './PortalShell.vue'

const navItems = [
  { name: 'principal-kits', label: 'Kits' },
  { name: 'principal-teachers', label: 'Teachers' }
]
</script>

<template>
  <PortalShell :nav-items="navItems" role-label="Principal" topbar-label="School workspace" />
</template>
