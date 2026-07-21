import { paginate } from '@/utils/paginate'

// Simulates network latency so the UI loading states are visible during demo.
export function fakeDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Wraps an array of items into the Spring Page shape that all list callers expect.
export const toPage = paginate

// Generates a simple incrementing id for items added during the demo session.
let nextId = 1000
export function nextMockId() {
  return nextId++
}
