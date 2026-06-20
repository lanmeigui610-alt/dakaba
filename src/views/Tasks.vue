<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <header class="mb-5">
      <h1 class="text-2xl font-black">任务中心</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">打卡任务、待办事项、临时清单分开管理。</p>
    </header>

    <section class="mb-4 grid grid-cols-3 gap-2">
      <button v-for="tab in tabs" :key="tab.key" class="tap rounded-lg border px-3 py-2 text-sm font-bold" :class="activeTab === tab.key ? 'border-pixel bg-pixel text-zinc-950' : 'border-black/10 bg-white dark:border-white/10 dark:bg-zinc-900'" @click="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </section>

    <section class="card mb-4">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h2 class="font-bold">{{ currentTitle }}</h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ currentHint }}</p>
        </div>
        <span class="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">{{ unfinishedCount }} 未完成</span>
      </div>
      <div class="flex gap-2">
        <input v-model="newTask" class="min-w-0 flex-1 rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" :placeholder="placeholder" @keydown.enter="addTask" />
        <button class="tap rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white dark:bg-white dark:text-zinc-950" @click="addTask">加</button>
      </div>
    </section>

    <section class="space-y-3">
      <label v-for="task in filteredTasks" :key="task.id" class="card tap flex items-center gap-3">
        <input type="checkbox" :checked="task.completed" class="h-5 w-5 accent-green-500" @change="complete(task)" />
        <div class="min-w-0 flex-1">
          <p class="font-semibold" :class="{ 'line-through opacity-50': task.completed }">{{ task.title }}</p>
          <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ task.meta }}</p>
        </div>
        <span class="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">{{ task.typeLabel }}</span>
      </label>
    </section>
  </main>
  <PixelPet ref="pet" />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { createPlan, listPlans, togglePlan } from '../api/plans'

const today = new Date().toISOString().slice(0, 10)
const activeTab = ref('checkin')
const newTask = ref('')
const plans = ref([])
const localTasks = ref([
  { id: 'todo-1', title: '整理 Supabase 配置', completed: false, type: 'todo', meta: '一次性待办', typeLabel: '待办' },
  { id: 'idea-1', title: '记录一个产品灵感', completed: false, type: 'temp', meta: '随手事项', typeLabel: '临时' },
])
const pet = ref(null)

const tabs = [
  { key: 'checkin', label: '打卡' },
  { key: 'todo', label: '待办' },
  { key: 'temp', label: '临时' },
]

const checkinTasks = computed(() => plans.value.map((plan) => ({
  ...plan,
  type: 'checkin',
  meta: '每日重复',
  typeLabel: '打卡',
})))

const allTasks = computed(() => [...checkinTasks.value, ...localTasks.value])
const filteredTasks = computed(() => allTasks.value.filter((task) => task.type === activeTab.value))
const unfinishedCount = computed(() => filteredTasks.value.filter((task) => !task.completed).length)
const currentTitle = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || '任务')
const currentHint = computed(() => ({
  checkin: '适合每天重复完成的习惯任务。',
  todo: '适合有明确截止或一次性完成的事项。',
  temp: '适合脑子里突然冒出来的小事。',
}[activeTab.value]))
const placeholder = computed(() => ({
  checkin: '例如：背单词 20 分钟',
  todo: '例如：完成部署配置',
  temp: '例如：买贴纸、记灵感',
}[activeTab.value]))

onMounted(async () => {
  plans.value = await listPlans(today).catch(() => [])
})

async function addTask() {
  if (!newTask.value.trim()) return
  if (activeTab.value === 'checkin') {
    plans.value.push(await createPlan(newTask.value.trim(), today))
  } else {
    localTasks.value.unshift({
      id: crypto.randomUUID(),
      title: newTask.value.trim(),
      completed: false,
      type: activeTab.value,
      meta: activeTab.value === 'todo' ? '一次性待办' : '随手事项',
      typeLabel: activeTab.value === 'todo' ? '待办' : '临时',
    })
  }
  newTask.value = ''
}

async function complete(task) {
  if (task.type === 'checkin') {
    const updated = await togglePlan(task)
    plans.value = plans.value.map((item) => (item.id === updated.id ? updated : item))
    if (updated.completed) pet.value?.poke()
  } else {
    task.completed = !task.completed
    if (task.completed) pet.value?.poke()
  }
}
</script>
