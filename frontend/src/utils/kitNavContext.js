// Contextual "back" navigation for kit detail pages (public + Principal/
// Teacher portals share the shape, though only the public site currently
// has multiple entry points). A kit can be reached from Home, a Grade page,
// Programs, or a Category — "back" should return to that specific place,
// not a hardcoded "Back to Programs".
//
// Safety: the resolved *route* is always one of a small whitelisted set of
// named routes baked into SOURCES below — the query string only supplies a
// display value (a grade name / category id) that gets attached to that
// fixed route, never a raw path or external URL. An unknown/missing/invalid
// `from` always falls back to a safe default rather than trusting the URL.

const MAX_VALUE_LENGTH = 60

const SOURCES = {
  home: {
    label: () => 'Back to Home',
    to: () => ({ name: 'public-home' })
  },
  grade: {
    label: (value) => `Back to ${value}`,
    to: (value) => ({ name: 'public-grades', query: { grade: value } })
  },
  program: {
    label: () => 'Back to Programs',
    to: () => ({ name: 'public-programs' })
  },
  category: {
    label: (value, label) => `Back to ${label || value}`,
    to: (value) => ({ name: 'public-categories', query: { category: value } })
  },
  categories: {
    label: () => 'Back to Categories',
    to: () => ({ name: 'public-categories' })
  },
  search: {
    // `value` here is a URL-encoded query string (e.g. "q=robot&grade=Grade+5"),
    // not a single short display value — allowed a much larger length cap
    // (see maxLength below). Only a small whitelist of known keys is ever
    // reconstructed into the target route's query, so a hand-edited/corrupt
    // value can't inject arbitrary query params.
    label: () => 'Back to Search',
    to: (value) => {
      const parsed = new URLSearchParams(value)
      const query = {}
      for (const key of ['q', 'grade', 'category', 'sort']) {
        if (parsed.has(key)) query[key] = parsed.get(key)
      }
      return { name: 'public-search', query }
    },
    maxLength: 300
  }
}

export const FALLBACK_TARGET = {
  label: 'Back to Kits',
  to: { name: 'public-programs' }
}

function isSafeValue(value, maxLength = MAX_VALUE_LENGTH) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

/**
 * Builds the query object to attach to a kit-detail RouterLink `to`.
 * @param {'home'|'grade'|'program'|'category'|'categories'|'search'} from
 * @param {string} [value] — the identifying value for that source (grade name, category id)
 * @param {string} [label] — precomputed display label (e.g. category name) when `value` is an id
 */
export function buildKitContext(from, value, label) {
  if (!SOURCES[from]) return {}
  const query = { from }
  if (value !== undefined && value !== null && String(value).length > 0) {
    query.value = String(value)
  }
  if (label) query.label = String(label).slice(0, MAX_VALUE_LENGTH)
  return query
}

/**
 * Resolves a kit-detail route's `route.query` into a safe { label, to }
 * back-navigation target. Never trusts `from`/`value` beyond the
 * whitelisted SOURCES map — anything unrecognized or malformed falls back
 * to FALLBACK_TARGET.
 */
export function resolveBackTarget(query = {}) {
  const from = typeof query.from === 'string' ? query.from : ''
  const source = SOURCES[from]
  if (!source) return FALLBACK_TARGET

  const value = isSafeValue(query.value, source.maxLength) ? query.value.trim() : ''
  const label = isSafeValue(query.label) ? query.label.trim() : ''

  if ((from === 'grade' || from === 'category') && !value) return FALLBACK_TARGET

  return {
    label: source.label(value, label),
    to: source.to(value)
  }
}
