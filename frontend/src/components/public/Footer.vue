<script setup>
const columns = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: { name: 'public-about' } },
      { label: 'Contact', to: { name: 'public-contact' } }
    ]
  },
  {
    title: 'Explore',
    links: [
      { label: 'Categories', to: { name: 'public-categories' } },
      { label: 'Programs', to: { name: 'public-programs' } }
    ]
  }
]
</script>

<template>
  <footer class="bg-navy-900 text-white relative overflow-hidden">
    <span class="absolute -left-16 top-10 w-40 h-32 blue-splash opacity-30"></span>
    <span class="absolute -right-16 bottom-6 w-44 h-32 orange-splash opacity-40"></span>
    <div class="max-w-[1440px] mx-auto px-5 md:px-10 py-10 grid grid-cols-2 md:grid-cols-[1.4fr,0.8fr,0.8fr,1.2fr] gap-8">
      <div class="col-span-2 md:col-span-1">
        <div class="flex items-center gap-2 mb-2.5">
          <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-8 h-8" />
          <span class="font-display font-bold">Yntra Sparks</span>
        </div>
        <p class="text-white/60 text-sm max-w-xs leading-snug">Where curiosity becomes capability — hands-on STEM kits for schools.</p>
      </div>

      <div v-for="col in columns" :key="col.title">
        <p class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-2.5">{{ col.title }}</p>
        <ul class="space-y-1.5">
          <li v-for="link in col.links" :key="link.label">
            <RouterLink :to="link.to" class="text-sm text-white/70 hover:text-white transition">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </div>

      <div class="col-span-2 md:col-span-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-white/40 mb-2.5">Stay updated</p>
        <form class="flex gap-2" @submit.prevent>
          <input
            type="email"
            placeholder="you@school.com"
            class="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-spark-500"
          >
          <button type="submit" class="px-4 py-2 rounded-lg bg-spark-500 hover:bg-spark-600 text-sm font-semibold transition shrink-0">
            Join
          </button>
        </form>
      </div>
    </div>

    <div class="border-t border-white/10">
      <div class="max-w-[1440px] mx-auto px-5 md:px-10 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
        <p>&copy; {{ new Date().getFullYear() }} Yntra Sparks. All rights reserved.</p>
        <div class="flex gap-4">
          <span class="hover:text-white/70 cursor-pointer transition">Privacy</span>
          <span class="hover:text-white/70 cursor-pointer transition">Terms</span>
        </div>
      </div>
    </div>
  </footer>
</template>
