import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// jsdom doesn't implement scrollTo — router/index.js's scrollBehavior calls
// it on every navigation in the router guard tests, which otherwise spams
// "Not implemented" warnings with no bearing on test correctness.
window.scrollTo = () => {}

afterEach(() => {
  localStorage.clear()
})
