import http, { unwrap } from './http'

export const healthService = {
  check() {
    return unwrap(http.get('/health'))
  }
}
