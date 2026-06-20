<template>
  <main class="mx-auto max-w-md px-4 py-5">
    <h1 class="mb-5 text-2xl font-bold">统计面板</h1>
    <section class="grid grid-cols-2 gap-3">
      <div v-for="item in cards" :key="item.label" class="card">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ item.label }}</p>
        <p class="mt-2 text-3xl font-black">{{ item.value }}</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAdminStats } from '../api/admin'

const stats = ref({})

onMounted(async () => {
  stats.value = await getAdminStats().catch(() => ({}))
})

const cards = computed(() => [
  { label: '注册总人数', value: stats.value.total_users || 0 },
  { label: '今日活跃', value: stats.value.today_active_users || 0 },
  { label: '总打卡次数', value: stats.value.total_checkins || 0 },
  { label: '存储占用 MB', value: stats.value.storage_mb || 0 },
])
</script>
