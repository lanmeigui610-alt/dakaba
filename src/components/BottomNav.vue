<template>
  <nav class="mobile-nav fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/80 px-3 pb-[env(safe-area-inset-bottom)] pt-2 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/80">
    <div class="mx-auto grid max-w-md grid-cols-5 gap-1 text-xs">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="tap flex flex-col items-center gap-1 rounded-lg px-2 py-2" active-class="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>
  </nav>

  <nav class="desktop-dock fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 rounded-2xl border border-white/10 bg-zinc-950/72 p-2 text-white shadow-soft backdrop-blur-2xl">
    <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="tap group relative mb-2 flex h-12 w-12 items-center justify-center rounded-xl last:mb-0 hover:bg-white/10" active-class="bg-pixel text-zinc-950">
      <component :is="item.icon" class="h-5 w-5" />
      <span class="pointer-events-none absolute left-14 whitespace-nowrap rounded-lg bg-zinc-950 px-2 py-1 text-xs text-white opacity-0 shadow-soft transition group-hover:opacity-100">{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { Home, ListTodo, PlusSquare, Settings, UserRound } from '@lucide/vue'

const items = [
  { to: '/', label: '首页', icon: Home },
  { to: '/tasks', label: '任务', icon: ListTodo },
  { to: '/publish', label: '发布', icon: PlusSquare },
  { to: '/profile', label: '我的', icon: UserRound },
  { to: '/settings', label: '设置', icon: Settings },
]
</script>

<style scoped>
@media (min-width: 900px) {
  :global(.mode-auto) .mobile-nav,
  :global(.mode-desktop) .mobile-nav {
    display: none;
  }

  :global(.mode-auto) .desktop-dock,
  :global(.mode-desktop) .desktop-dock {
    display: block;
  }
}

:global(.mode-mobile) .desktop-dock {
  display: none;
}
</style>
