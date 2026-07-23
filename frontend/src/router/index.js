import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore, ROLES } from '@/stores/auth'

const routes = [
  // ---------------- Public marketing site ----------------
  {
    path: '/',
    component: () => import('@/layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'public-home', component: () => import('@/views/public/HomeView.vue') },
      { path: 'about', name: 'public-about', component: () => import('@/views/public/AboutView.vue') },
      { path: 'categories', name: 'public-categories', component: () => import('@/views/public/CategoriesView.vue') },
      { path: 'grades', name: 'public-grades', component: () => import('@/views/public/GradesView.vue') },
      { path: 'programs', name: 'public-programs', component: () => import('@/views/public/ProgramsView.vue') },
      { path: 'kits/:id', name: 'public-kit-detail', component: () => import('@/views/public/KitDetailView.vue'), props: true },
      { path: 'search', name: 'public-search', component: () => import('@/views/public/SearchView.vue') },
      { path: 'contact', name: 'public-contact', component: () => import('@/views/public/ContactView.vue') },
      { path: 'privacy', name: 'public-privacy', component: () => import('@/views/public/PrivacyPolicyView.vue') },
      { path: 'terms', name: 'public-terms', component: () => import('@/views/public/TermsView.vue') }
    ]
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },

  // Reachable by any authenticated role — not role-gated like /admin,
  // /principal, /teacher. See the mustChangePassword handling below.
  {
    path: '/change-password',
    name: 'change-password',
    component: () => import('@/views/ChangePasswordView.vue'),
    meta: { requiresAuth: true }
  },

  // ---------------- Super Admin ----------------
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { roles: [ROLES.SUPER_ADMIN] },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/views/superadmin/DashboardView.vue') },
      { path: 'schools', name: 'admin-schools', component: () => import('@/views/superadmin/SchoolsView.vue') },
      { path: 'principals', name: 'admin-principals', component: () => import('@/views/superadmin/PrincipalsView.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('@/views/superadmin/CategoriesView.vue') },
      { path: 'kits', name: 'admin-kits', component: () => import('@/views/superadmin/KitsView.vue') },
      { path: 'messages', name: 'admin-messages', component: () => import('@/views/superadmin/MessagesView.vue') },
      { path: 'kits/new', name: 'admin-kit-new', component: () => import('@/views/superadmin/KitFormView.vue') },
      { path: 'kits/:id/edit', name: 'admin-kit-edit', component: () => import('@/views/superadmin/KitFormView.vue'), props: true },
      { path: 'profile', name: 'admin-profile', component: () => import('@/views/portal/ProfileView.vue') },
      { path: 'notifications', name: 'admin-notifications', component: () => import('@/views/portal/NotificationsView.vue') }
    ]
  },

  // ---------------- Principal ----------------
  {
    path: '/principal',
    component: () => import('@/layouts/PrincipalLayout.vue'),
    meta: { roles: [ROLES.PRINCIPAL] },
    children: [
      { path: '', name: 'principal-dashboard', component: () => import('@/views/principal/DashboardView.vue') },
      { path: 'kits', name: 'principal-kits', component: () => import('@/views/principal/KitsView.vue') },
      { path: 'kits/:id', name: 'principal-kit-detail', component: () => import('@/views/principal/KitDetailView.vue'), props: true },
      { path: 'saved', name: 'principal-saved-kits', component: () => import('@/views/portal/SavedKitsView.vue') },
      { path: 'teachers', name: 'principal-teachers', component: () => import('@/views/principal/TeachersView.vue') },
      { path: 'profile', name: 'principal-profile', component: () => import('@/views/portal/ProfileView.vue') },
      { path: 'notifications', name: 'principal-notifications', component: () => import('@/views/portal/NotificationsView.vue') }
    ]
  },

  // ---------------- Teacher ----------------
  {
    path: '/teacher',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: { roles: [ROLES.TEACHER] },
    children: [
      { path: '', name: 'teacher-dashboard', component: () => import('@/views/teacher/DashboardView.vue') },
      { path: 'kits', name: 'teacher-kits', component: () => import('@/views/teacher/KitsView.vue') },
      { path: 'kits/:id', name: 'teacher-kit-detail', component: () => import('@/views/teacher/KitDetailView.vue'), props: true },
      { path: 'saved', name: 'teacher-saved-kits', component: () => import('@/views/portal/SavedKitsView.vue') },
      { path: 'profile', name: 'teacher-profile', component: () => import('@/views/portal/ProfileView.vue') },
      { path: 'notifications', name: 'teacher-notifications', component: () => import('@/views/portal/NotificationsView.vue') }
    ]
  },

  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/ErrorView.vue'),
    props: { code: 403 }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/ErrorView.vue'),
    props: { code: 404 }
  }
]

// Matches the sticky public header's tallest state (see Navbar.vue) plus a
// little breathing room, so a hash-target heading doesn't land underneath it.
export const HASH_SCROLL_OFFSET = 96

// Pure decision logic, split out from the scrollBehavior hook below so it's
// unit-testable without a real browser/router (see tests/unit/router/scrollBehavior.spec.js).
export function resolveScrollTarget(to, from, savedPosition) {
  if (savedPosition) {
    // Browser Back/Forward — vue-router already captured this position
    // when the user navigated away; always prefer it over anything else.
    return savedPosition
  }
  if (to.hash) {
    return { el: to.hash, top: HASH_SCROLL_OFFSET, behavior: 'smooth' }
  }
  if (to.path === from.path) {
    // Same path, e.g. only the query changed (pagination, filters) — don't
    // yank the user back to the top of a page they're still on.
    return false
  }
  return { top: 0 }
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    const target = resolveScrollTarget(to, from, savedPosition)

    // The outgoing page is still mid-transition (route-fade leave, 180ms —
    // see style.css) when scrollBehavior first runs, and the incoming page
    // may still be fetching data that affects its height (e.g. HomeView's
    // featured kits). Resolving on a short delay instead of immediately
    // avoids restoring/scrolling against a not-yet-settled layout.
    return new Promise((resolve) => {
      setTimeout(() => resolve(target), 180)
    })
  }
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Wait for bootstrap to finish before making any auth decision.
  // Without this, a hard refresh races: the guard sees isAuthenticated=false
  // mid-bootstrap and redirects to /login or /403 prematurely.
  if (auth.isBootstrapping) {
    await new Promise((resolve) => {
      const unwatch = auth.$subscribe(() => {
        if (!auth.isBootstrapping) {
          unwatch()
          resolve()
        }
      })
    })
  }

  const requiredRoles = to.meta.roles
  const requiresAuth = !!requiredRoles || !!to.meta.requiresAuth

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: auth.homePath }
  }

  if (requiresAuth) {
    if (!auth.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    // Authenticated but wrong role → explicit 403, never a silent redirect
    // to their own dashboard and never a blank page (user-flows.md).
    if (requiredRoles && !requiredRoles.includes(auth.role)) {
      return { name: 'forbidden' }
    }
  }

  // Forced password change (api-contract.md's mustChangePassword flag):
  // block every protected route until it's cleared, but never touch this
  // check for the change-password route itself — that's the redirect
  // loop guard (comparing to.name, not auth state, so it can't flap).
  if (auth.isAuthenticated && auth.mustChangePassword && to.name !== 'change-password') {
    return { name: 'change-password' }
  }
  if (to.name === 'change-password' && auth.isAuthenticated && !auth.mustChangePassword) {
    return { path: auth.homePath }
  }

  return true
})

export default router
