import { defineStore } from 'pinia'
import { authService } from '@/api/authService'
import { bindAuthStore } from '@/api/http'

// Role names exactly as issued by the backend JWT / LoginResponse.user.role.
// Single source of truth: never compare against string literals elsewhere.
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER'
}

// Matches the route structure already built: /admin/* for Super Admin,
// /principal/* for Principal, /teacher/* for Teacher.
export const ROLE_HOME = {
  [ROLES.SUPER_ADMIN]: '/admin',
  [ROLES.PRINCIPAL]: '/principal',
  [ROLES.TEACHER]: '/teacher'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Per ADR-005: access token lives only in memory. A hard refresh clears it,
    // then bootstrap() restores the session via the httpOnly refresh cookie.
    accessToken: null,
    user: null, // { id, name, email, role, schoolId, mustChangePassword }
    isBootstrapping: true
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    role: (state) => state.user?.role ?? null,
    homePath: (state) => (state.user ? (ROLE_HOME[state.user.role] ?? '/login') : '/login')
  },

  actions: {
    async login(email, password) {
      const { accessToken, user } = await authService.login(email, password)
      this.accessToken = accessToken
      this.user = user
      return user
    },

    async logout() {
      try {
        await authService.logout()
      } finally {
        // Clear local state even if the network call fails.
        this.accessToken = null
        this.user = null
      }
    },

    /** Used by the response interceptor on a 401, and by bootstrap(). */
    async refreshAccessToken() {
      const newToken = await authService.refresh()
      this.accessToken = newToken
      return newToken
    },

    /** Called once from App.vue on initial mount, before any route renders. */
    async bootstrap() {
      try {
        await this.refreshAccessToken()
        this.user = await authService.me()
      } catch {
        this.accessToken = null
        this.user = null
      } finally {
        this.isBootstrapping = false
      }
    },

    /** Called by the http interceptor when a refresh itself fails. */
    forceLogout() {
      this.accessToken = null
      this.user = null
    }
  }
})

// Registered here so the first import of the store wires up http.js's
// access-token lookup without depending on main.js startup order.
export function registerAuthStoreWithHttp(store) {
  bindAuthStore(store)
}
