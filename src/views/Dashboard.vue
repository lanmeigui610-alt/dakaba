<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <header class="mb-5 rounded-b-[28px] bg-zinc-950 px-4 pb-5 pt-4 text-white shadow-soft dark:bg-black">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm text-zinc-400">DakaBa</p>
          <h1 class="mt-1 text-3xl font-black tracking-normal">哒咔Ba</h1>
          <p class="mt-2 text-sm text-zinc-300">打卡、数日、待办、日记和朋友圈都在这里。</p>
        </div>
        <RouterLink to="/profile" class="tap h-12 w-12 overflow-hidden rounded-lg border border-white/15 bg-white/10">
          <img :src="avatar" class="h-full w-full object-cover" alt="" />
        </RouterLink>
      </div>

      <div class="mt-5 grid grid-cols-3 gap-2">
        <div class="rounded-lg bg-white/10 p-3">
          <p class="text-xs text-zinc-400">今日完成</p>
          <p class="mt-1 text-2xl font-black">{{ completedCount }}</p>
        </div>
        <div class="rounded-lg bg-white/10 p-3">
          <p class="text-xs text-zinc-400">连续打卡</p>
          <p class="mt-1 text-2xl font-black">12</p>
        </div>
        <div class="rounded-lg bg-white/10 p-3">
          <p class="text-xs text-zinc-400">累计记录</p>
          <p class="mt-1 text-2xl font-black">38</p>
        </div>
      </div>
    </header>

    <section class="mb-4 grid grid-cols-4 gap-3">
      <RouterLink v-for="item in featureGrid" :key="item.title" :to="item.to" class="tap rounded-lg border border-black/10 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <component :is="item.icon" class="mx-auto h-6 w-6" :class="item.color" />
        <span class="mt-2 block text-xs font-semibold">{{ item.title }}</span>
      </RouterLink>
    </section>

    <section class="card mb-4">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h2 class="font-bold">今日打卡任务</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">适合习惯、学习、运动、喝水等重复打卡</p>
        </div>
        <button class="tap rounded-lg bg-pixel px-3 py-1.5 text-sm font-bold text-zinc-950" @click="addPlan">添加</button>
      </div>
      <div class="mb-3 flex gap-2">
        <input v-model="newPlan" class="min-w-0 flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" placeholder="新建一个打卡任务" @keydown.enter="addPlan" />
      </div>
      <div class="space-y-2">
        <label v-for="plan in plans" :key="plan.id" class="tap flex items-center gap-3 rounded-lg bg-zinc-100 px-3 py-3 dark:bg-zinc-800">
          <input type="checkbox" :checked="plan.completed" class="h-5 w-5 accent-green-500" @change="complete(plan)" />
          <span class="min-w-0 flex-1" :class="{ 'line-through opacity-50': plan.completed }">{{ plan.title }}</span>
          <span class="rounded bg-white px-2 py-1 text-xs dark:bg-zinc-900">每日</span>
        </label>
      </div>
    </section>

    <section class="mb-4">
      <div class="mb-2 flex items-center justify-between">
        <h2 class="font-bold">数日与倒计时</h2>
        <RouterLink to="/calendar" class="text-sm text-zinc-500">全部</RouterLink>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div v-for="item in countdowns" :key="item.id" class="card overflow-hidden">
          <div class="mb-3 h-1.5 rounded-full" :style="{ background: item.color || '#52d273' }"></div>
          <p class="text-sm font-semibold">{{ item.title }}</p>
          <p class="mt-1 text-4xl font-black">{{ daysLeft(item.target_date) }}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">天后</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="font-bold">随手记录</h2>
        <RouterLink to="/publish" class="tap rounded-lg bg-zinc-950 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-zinc-950">发布</RouterLink>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <button v-for="item in quickRecords" :key="item" class="tap rounded-lg bg-zinc-100 px-2 py-3 text-sm font-semibold dark:bg-zinc-800">{{ item }}</button>
      </div>
    </section>
  </main>
  <PixelPet ref="pet" />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { BookOpenText, CalendarDays, CheckSquare, Clock3, Flame, Images, ListTodo, SmilePlus } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { createPlan, listPlans, togglePlan } from '../api/plans'
import { listCountdowns } from '../api/time'

const today = new Date().toISOString().slice(0, 10)
const avatar = 'https://api.dicebear.com/9.x/pixel-art/svg?seed=dakaba'
const plans = ref([])
const countdowns = ref([])
const newPlan = ref('')
const pet = ref(null)
const quickRecords = ['心情', '日记', '灵感']

const featureGrid = [
  { title: '打卡', to: '/tasks', icon: Flame, color: 'text-orange-500' },
  { title: '待办', to: '/tasks', icon: ListTodo, color: 'text-sky-500' },
  { title: '数日', to: '/calendar', icon: Clock3, color: 'text-green-500' },
  { title: '日历', to: '/calendar', icon: CalendarDays, color: 'text-violet-500' },
  { title: '日记', to: '/calendar', icon: BookOpenText, color: 'text-rose-500' },
  { title: '朋友圈', to: '/feed', icon: Images, color: 'text-cyan-500' },
  { title: '心情', to: '/calendar', icon: SmilePlus, color: 'text-yellow-500' },
  { title: '回顾', to: '/profile', icon: CheckSquare, color: 'text-emerald-500' },
]

const completedCount = computed(() => plans.value.filter((plan) => plan.completed).length)

onMounted(async () => {
  plans.value = await listPlans(today).catch(() => [])
  countdowns.value = await listCountdowns().catch(() => [])
})

async function addPlan() {
  if (!newPlan.value.trim()) return
  plans.value.push(await createPlan(newPlan.value.trim(), today))
  newPlan.value = ''
}

async function complete(plan) {
  const updated = await togglePlan(plan)
  plans.value = plans.value.map((item) => (item.id === updated.id ? updated : item))
  if (updated.completed) pet.value?.poke()
}

function daysLeft(date) {
  const diff = new Date(date) - new Date(today)
  return Math.max(0, Math.ceil(diff / 86400000))
}
</script>
