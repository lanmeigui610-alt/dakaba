<template>
  <nav class="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-white/90 px-3 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur dark:border-white/10 dark:bg-zinc-950/88">
    <div class="mx-auto grid max-w-md grid-cols-5 gap-1 text-xs">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="tap flex flex-col items-center gap-1 rounded-lg px-2 py-2" active-class="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
        <component :is="item.icon" class="h-5 w-5" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>
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
