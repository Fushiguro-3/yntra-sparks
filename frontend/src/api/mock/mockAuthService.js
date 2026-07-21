import { fakeDelay } from './mockHelpers'

// Demo credentials — each maps to a role and school. Kept as a frozen seed
// plus a mutable working copy so tests (and `_resetDemoUsers()`) can
// restore original passwords/flags after a changePassword() call mutates
// the working copy — same in-memory-mutation pattern as the other mock
// services (schools, teachers, ...).
const DEMO_USERS_SEED = [
  { email: 'admin@yntrasparks.com', password: 'demo1234', id: 1, name: 'Super Admin', role: 'SUPER_ADMIN', schoolId: null, mustChangePassword: false },
  { email: 'principal@dps.edu.in', password: 'demo1234', id: 2, name: 'Principal DPS', role: 'PRINCIPAL', schoolId: 1, mustChangePassword: false },
  { email: 'teacher@dps.edu.in', password: 'demo1234', id: 3, name: 'Priya Sharma', role: 'TEACHER', schoolId: 1, mustChangePassword: false },
  // Demonstrates the forced-password-change flow (src/views/ChangePasswordView.vue):
  // a freshly created account, as if a Principal just added this teacher
  // and the temp password hasn't been changed yet.
  { email: 'newteacher@dps.edu.in', password: 'temp1234', id: 4, name: 'New Teacher', role: 'TEACHER', schoolId: 1, mustChangePassword: true },
]

let DEMO_USERS = DEMO_USERS_SEED.map((u) => ({ ...u }))
let currentUser = null

export const mockAuthService = {
  async login(email, password) {
    await fakeDelay()
    const user = DEMO_USERS.find((u) => u.email === email && u.password === password)
    if (!user) throw { message: 'Invalid email or password', status: 401 }
    currentUser = user
    return { accessToken: 'mock-token', user }
  },

  async refresh() {
    await fakeDelay(100)
    if (!currentUser) throw { message: 'No session', status: 401 }
    return 'mock-token'
  },

  async me() {
    await fakeDelay(100)
    if (!currentUser) throw { message: 'Not authenticated', status: 401 }
    return currentUser
  },

  async logout() {
    await fakeDelay(100)
    currentUser = null
  },

  async changePassword(currentPassword, newPassword) {
    await fakeDelay()
    if (!currentUser) throw { message: 'Not authenticated', status: 401 }
    if (currentUser.password !== currentPassword) {
      throw { message: 'Current password is incorrect.', status: 400 }
    }
    // Mutates the DEMO_USERS entry too (currentUser is a reference into
    // that array) so the new password is what future logins expect for
    // the rest of this session.
    currentUser.password = newPassword
    currentUser.mustChangePassword = false
    return { ...currentUser }
  },

  _setUser(user) {
    currentUser = user
  },

  /** Test-only: undoes changePassword() mutations between test cases. */
  _resetDemoUsers() {
    DEMO_USERS = DEMO_USERS_SEED.map((u) => ({ ...u }))
    currentUser = null
  }
}
