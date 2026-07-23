<script setup>
import PortalShell from './PortalShell.vue'

const navItems = [
  { name: 'principal-dashboard', label: 'Dashboard' },
  { name: 'principal-kits', label: 'Kits' },
  { name: 'principal-saved-kits', label: 'Saved Kits' },
  { name: 'principal-teachers', label: 'Teachers' },
  { name: 'principal-notifications', label: 'Notifications' }
]
</script>

<template>
  <PortalShell
    :nav-items="navItems"
    role-label="Principal"
    topbar-label="School workspace"
    dashboard-route="principal-dashboard"
    profile-route="principal-profile"
    notifications-route="principal-notifications"
  />
</template>
