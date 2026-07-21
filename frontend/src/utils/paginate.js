// Wraps an already-in-memory array into the Spring Page shape used
// throughout the app. Shared by src/api/mock/mockHelpers.js (toPage) and
// src/services/messagesService.js, which paginates a merged list that
// doesn't come from a single paginated source.
export function paginate(items, page = 0, size = 20) {
  const start = page * size
  const content = items.slice(start, start + size)
  return {
    content,
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size) || 1
  }
}
