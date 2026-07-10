import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore, registerAuthStoreWithHttp } from './stores/auth'
import { initAos } from './utils/aos'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Must happen before the router (and before any component can fire a
// request) so http.js always has a store to read the access token from.
registerAuthStoreWithHttp(useAuthStore())

app.use(router)
app.mount('#app')

initAos(router)
