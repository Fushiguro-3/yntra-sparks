<script setup>
import PortalShell from './PortalShell.vue'

const navItems = [
  { name: 'admin-schools', label: 'Schools' },
  { name: 'admin-principals', label: 'Principals' },
  { name: 'admin-categories', label: 'Categories' },
  { name: 'admin-kits', label: 'Kits' },
  { name: 'admin-messages', label: 'Messages' }
]
</script>

<template>
  <PortalShell :nav-items="navItems" role-label="Super Admin" topbar-label="Command centre" />
</template>
