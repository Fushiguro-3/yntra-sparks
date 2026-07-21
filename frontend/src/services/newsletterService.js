// Buttondown newsletter subscription.
//
// Buttondown's public "embed subscribe" endpoint is designed to be the
// action of a plain HTML <form> (full-page submit or hidden-iframe
// target) — it does not return CORS headers for XHR/fetch, and it doesn't
// require or accept an API key (an API key must never be shipped to the
// browser: see .env.example). Docs: https://docs.buttondown.com/building-your-subscriber-base
//
// To get an async, in-page loading/success/error flow out of a classic
// form-post endpoint without a backend proxy, we submit with
// `fetch(..., { mode: 'no-cors' })`. Browsers allow a "simple" cross-origin
// POST (application/x-www-form-urlencoded body, no custom headers) through
// in no-cors mode — the request really is sent, we just can't read the
// response (it comes back "opaque": no status, no body). So:
//   - a resolved promise means the request reached the network and Buttondown
//     received it — treated as success (matches how a real <form> POST to
//     this endpoint behaves; Buttondown itself silently no-ops a duplicate
//     subscribe rather than erroring).
//   - a rejected promise means it never left the browser (offline, DNS
//     failure, ad-blocker) — treated as a real error.
// Confirmation is double opt-in by default on every Buttondown newsletter,
// so the subscriber's inbox is the actual source of truth for success.
import { env } from '@/utils/env'

function buildEndpoint() {
  return `https://buttondown.com/api/emails/embed-subscribe/${env.buttondownUsername}`
}

export const newsletterService = {
  async subscribe(email) {
    const body = new URLSearchParams({ email, embed: '1' })
    await fetch(buildEndpoint(), {
      method: 'POST',
      mode: 'no-cors',
      body
    })
    // no-cors responses are always opaque (status 0) even on success —
    // there is nothing further to inspect here.
  }
}
