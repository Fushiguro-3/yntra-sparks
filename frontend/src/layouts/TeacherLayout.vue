<script setup>
import PortalShell from './PortalShell.vue'

const navItems = [
  { name: 'teacher-dashboard', label: 'Dashboard' },
  { name: 'teacher-kits', label: "My School's Kits" },
  { name: 'teacher-saved-kits', label: 'Saved Kits' },
  { name: 'teacher-notifications', label: 'Notifications' }
]
</script>

<template>
  <PortalShell
    :nav-items="navItems"
    role-label="Teacher"
    topbar-label="Teacher workspace"
    dashboard-route="teacher-dashboard"
    profile-route="teacher-profile"
    notifications-route="teacher-notifications"
  />
</template>
