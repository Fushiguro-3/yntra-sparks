// Local-only duplicate-submission guard for the newsletter form.
//
// Buttondown's public embed-subscribe endpoint (see newsletterService.js)
// is a classic HTML-form target: the browser gets an opaque response, so
// we can't ask Buttondown "is this email already subscribed?" before
// submitting. What we *can* do is remember, per-browser, which emails this
// visitor has already successfully submitted, and short-circuit the
// network call on a repeat attempt. This is a UX nicety, not a source of
// truth — Buttondown itself silently no-ops a duplicate double-opt-in
// email server-side regardless of what this store remembers.
const STORAGE_KEY = 'ys_newsletter_subscribed_v1'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(emails) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emails))
  } catch {
    // Best-effort — worst case the "already subscribed" shortcut just
    // doesn't fire and the visitor re-submits, which Buttondown handles.
  }
}

export const newsletterSubscriberStore = {
  has(email) {
    return readAll().includes(email.trim().toLowerCase())
  },

  add(email) {
    const normalized = email.trim().toLowerCase()
    const emails = readAll()
    if (!emails.includes(normalized)) {
      emails.push(normalized)
      writeAll(emails)
    }
  }
}
