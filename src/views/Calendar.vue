<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <header class="mb-5 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black">日历与数日</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">记录点、生日、倒计时都在这里</p>
      </div>
      <input v-model="month" type="month" class="w-36 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-zinc-900" />
    </header>

    <section class="card mb-4">
      <div class="mb-3 grid grid-cols-7 text-center text-xs font-semibold text-zinc-500">
        <span v-for="d in ['日','一','二','三','四','五','六']" :key="d">{{ d }}</span>
      </div>
      <div class="grid grid-cols-7 gap-2 text-center">
        <div v-for="day in days" :key="day.key" class="aspect-square rounded-lg p-1" :class="day.current ? 'bg-zinc-100 dark:bg-zinc-800' : 'opacity-25'">
          <span class="text-sm">{{ day.date.getDate() }}</span>
          <div class="mt-1 flex justify-center gap-1">
            <span v-if="marked(day)" class="h-1.5 w-1.5 rounded-full bg-pixel"></span>
            <span v-if="birthday(day)" class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          </div>
        </div>
      </div>
      <div class="mt-4 flex gap-4 text-xs text-zinc-500">
        <span class="flex items-center gap-1"><i class="h-2 w-2 rounded-full bg-pixel"></i>有记录</span>
        <span class="flex items-center gap-1"><i class="h-2 w-2 rounded-full bg-rose-500"></i>生日</span>
      </div>
    </section>

    <section class="mb-4">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="font-bold">数日卡片</h2>
        <button class="tap rounded-lg bg-zinc-950 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-zinc-950">新建</button>
      </div>
      <div class="space-y-3">
        <div v-for="item in countdowns" :key="item.id" class="card flex items-center gap-3">
          <div class="flex h-14 w-14 items-center justify-center rounded-lg text-xl font-black text-zinc-950" :style="{ background: item.color || '#52d273' }">{{ daysLeft(item.target_date) }}</div>
          <div class="min-w-0 flex-1">
            <h3 class="font-bold">{{ item.title }}</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400">目标日期 {{ item.target_date }}</p>
          </div>
          <span class="text-xs text-zinc-500">天</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="mb-3 font-bold">快速记录</h2>
      <div class="grid grid-cols-3 gap-2">
        <button class="tap rounded-lg bg-zinc-100 py-3 text-sm font-semibold dark:bg-zinc-800">写日记</button>
        <button class="tap rounded-lg bg-zinc-100 py-3 text-sm font-semibold dark:bg-zinc-800">记心情</button>
        <button class="tap rounded-lg bg-zinc-100 py-3 text-sm font-semibold dark:bg-zinc-800">加生日</button>
      </div>
    </section>
  </main>
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import BottomNav from '../components/BottomNav.vue'
import { listDiaryMarks } from '../api/diary'
import { listBirthdays, listCountdowns } from '../api/time'

const today = new Date().toISOString().slice(0, 10)
const month = ref(new Date().toISOString().slice(0, 7))
const marks = ref([])
const birthdays = ref([])
const countdowns = ref([])

onMounted(load)
watch(month, load)

async function load() {
  marks.value = await listDiaryMarks(month.value).catch(() => [])
  birthdays.value = await listBirthdays().catch(() => [])
  countdowns.value = await listCountdowns().catch(() => [])
}

const days = computed(() => {
  const start = new Date(`${month.value}-01T00:00:00`)
  const cursor = new Date(start)
  cursor.setDate(cursor.getDate() - cursor.getDay())
  return Array.from({ length: 42 }, () => {
    const date = new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
    return { key: date.toISOString(), date, current: date.getMonth() === start.getMonth() }
  })
})

function marked(day) {
  return marks.value.some((item) => item.entry_date === day.date.toISOString().slice(0, 10))
}

function birthday(day) {
  const md = day.date.toISOString().slice(5, 10)
  return birthdays.value.some((item) => item.birthday?.slice(5, 10) === md)
}

function daysLeft(date) {
  const diff = new Date(date) - new Date(today)
  return Math.max(0, Math.ceil(diff / 86400000))
}
</script>
