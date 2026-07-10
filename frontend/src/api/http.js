import axios from 'axios'

// ADR-005: refresh token is an httpOnly cookie the browser manages on its
// own (withCredentials makes the browser send/receive it). The access
// token is never persisted — it lives only in the auth store's memory and
// is attached here on every request.
const http = axios.create({
  baseURL: '/api',
  withCredentials: true
})

// Deferred access to the auth store to avoid a circular import at
// module-load time (the store uses `http`, so `http` can't import the
// store back at the top level).
let authStoreRef = null
export function bindAuthStore(store) {
  authStoreRef = store
}

http.interceptors.request.use((config) => {
  const token = authStoreRef?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Single-flight refresh: if several requests 401 at once, only one
// /auth/refresh call goes out; the rest await the same promise and retry
// once it resolves, instead of each firing its own refresh.
let refreshPromise = null

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    // No response at all = network/CORS failure, not an auth problem.
    if (!response) return Promise.reject(error)

    const isAuthEndpoint = config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')
    const alreadyRetried = config._retry

    if (response.status === 401 && !isAuthEndpoint && !alreadyRetried) {
      config._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = authStoreRef.refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newToken = await refreshPromise
        config.headers.Authorization = `Bearer ${newToken}`
        return http(config)
      } catch (refreshError) {
        authStoreRef?.forceLogout()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Unwraps the backend's { success, data, message, errors } envelope and
 * normalizes failures into one shape every service/component can rely on:
 *   { message, errors, status }
 * so calling code never has to branch on axios error shape vs backend shape.
 */
export function unwrap(promise) {
  return promise
    .then((res) => res.data.data)
    .catch((err) => {
      const body = err.response?.data
      const message = body?.message || err.message || 'Something went wrong. Please try again.'
      const errors = body?.errors || null
      const status = err.response?.status ?? 0
      return Promise.reject({ message, errors, status })
    })
}

export default http
