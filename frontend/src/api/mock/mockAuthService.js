import { fakeDelay } from './mockHelpers'

// Demo credentials — each maps to a role and school.
const DEMO_USERS = [
  { email: 'admin@yntrasparks.com', password: 'demo1234', id: 1, name: 'Super Admin', role: 'SUPER_ADMIN', schoolId: null, mustChangePassword: false },
  { email: 'principal@dps.edu.in', password: 'demo1234', id: 2, name: 'Principal DPS', role: 'PRINCIPAL', schoolId: 1, mustChangePassword: false },
  { email: 'teacher@dps.edu.in', password: 'demo1234', id: 3, name: 'Priya Sharma', role: 'TEACHER', schoolId: 1, mustChangePassword: false },
]

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

  _setUser(user) {
    currentUser = user
  }
}
