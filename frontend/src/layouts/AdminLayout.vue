<script setup>
import PortalShell from './PortalShell.vue'

const navItems = [
  { name: 'admin-dashboard', label: 'Dashboard' },
  { name: 'admin-schools', label: 'Schools' },
  { name: 'admin-principals', label: 'Principals' },
  { name: 'admin-categories', label: 'Categories' },
  { name: 'admin-kits', label: 'Kits' },
  { name: 'admin-messages', label: 'Messages' },
  { name: 'admin-notifications', label: 'Notifications' }
]
</script>

<template>
  <PortalShell
    :nav-items="navItems"
    role-label="Super Admin"
    topbar-label="Command centre"
    dashboard-route="admin-dashboard"
    profile-route="admin-profile"
    notifications-route="admin-notifications"
  />
</template>
