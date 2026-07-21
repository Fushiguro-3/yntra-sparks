<script setup>
import PortalShell from './PortalShell.vue'

const navItems = [
  { name: 'teacher-kits', label: "My School's Kits" }
]
</script>

<template>
  <PortalShell :nav-items="navItems" role-label="Teacher" topbar-label="Teacher workspace" />
</template>
