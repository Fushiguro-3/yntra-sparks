// Driven by VITE_USE_MOCK env variable so you can control this per-environment
// without touching code. Set VITE_USE_MOCK=false in Vercel to use the real backend.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
