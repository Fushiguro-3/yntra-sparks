import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore, registerAuthStoreWithHttp } from './stores/auth'
import { initAos } from './utils/aos'
import { validateEnv } from './utils/env'
import './style.css'

// Non-blocking: logs a console warning for any optional integration that's
// unconfigured. The app itself is always fully functional in mock mode.
validateEnv()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Must happen before the router (and before any component can fire a
// request) so http.js always has a store to read the access token from.
registerAuthStoreWithHttp(useAuthStore())

app.use(router)
app.mount('#app')

initAos(router)

// Dev-only hook so Playwright e2e tests (npm run test:e2e, always against
// `npm run dev`) can trigger client-side navigation instead of
// page.goto()'s full page reload — a hard reload wipes the in-memory
// access token / mock session by design (ADR-005), which is correct
// production behavior but would make every "authenticated user visits X"
// e2e scenario impossible to set up without a real backend's refresh
// cookie. Dead-code-eliminated from production builds since
// import.meta.env.DEV is statically false there.
if (import.meta.env.DEV) {
  window.__router = router
}
