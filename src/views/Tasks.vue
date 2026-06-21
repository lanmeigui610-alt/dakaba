<template>
  <main class="safe-bottom mx-auto px-4 py-5 lg:px-8">
    <header class="trace-hero mb-5">
      <p class="text-sm font-bold text-blue-500">Check-in Studio</p>
      <h1>打卡工作台</h1>
      <p>像成熟打卡软件一样，把习惯、目标、待办和复盘分层管理。</p>
    </header>

    <section class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <button v-for="tab in tabs" :key="tab.key" class="trace-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        <component :is="tab.icon" class="h-5 w-5" />
        <span>{{ tab.label }}</span>
      </button>
    </section>

    <section class="card mb-4">
      <div class="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-black">{{ currentTitle }}</h2>
          <p class="text-sm text-slate-500">{{ currentHint }}</p>
        </div>
        <span class="rounded-2xl bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{{ unfinishedCount }} 未完成</span>
      </div>
      <div class="grid gap-2 md:grid-cols-[1fr_auto]">
        <input v-model="newTask" class="trace-input" :placeholder="placeholder" @keydown.enter="addTask" />
        <button class="trace-primary" @click="addTask">添加</button>
      </div>
      <p v-if="toast" class="mt-3 rounded-2xl px-3 py-2 text-sm font-bold" :class="toastType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">{{ toast }}</p>
    </section>

    <section class="grid gap-3 lg:grid-cols-2">
      <article v-for="task in filteredTasks" :key="task.id" class="card flex items-center gap-3">
        <button class="check-ring" :class="{ done: task.completed }" @click="complete(task)">
          <Check v-if="task.completed" class="h-4 w-4" />
        </button>
        <div class="min-w-0 flex-1">
          <p class="font-bold" :class="{ 'line-through opacity-50': task.completed }">{{ task.title }}</p>
          <p class="text-xs text-slate-500">{{ task.meta }}</p>
        </div>
        <span class="rounded-2xl bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{{ task.typeLabel }}</span>
      </article>
    </section>
  </main>
  <PixelPet ref="pet" />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check, Flame, ListTodo, Target, TimerReset } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { createPlan, listPlans, togglePlan } from '../api/plans'

const today = new Date().toISOString().slice(0, 10)
const activeTab = ref('habit')
const newTask = ref('')
const plans = ref([])
const toast = ref('')
const toastType = ref('ok')
const pet = ref(null)
const localTasks = ref([
  { id: 'goal-1', title: '本周完成 5 次晨读', completed: false, type: 'goal', meta: '阶段目标', typeLabel: '目标' },
  { id: 'todo-1', title: '整理 Supabase 配置', completed: false, type: 'todo', meta: '一次性待办', typeLabel: '待办' },
])

const tabs = [
  { key: 'habit', label: '习惯', icon: Flame },
  { key: 'goal', label: '目标', icon: Target },
  { key: 'todo', label: '待办', icon: ListTodo },
  { key: 'review', label: '复盘', icon: TimerReset },
]

const habitTasks = computed(() => plans.value.map((plan) => ({ ...plan, type: 'habit', meta: '每日重复', typeLabel: '习惯' })))
const allTasks = computed(() => [...habitTasks.value, ...localTasks.value])
const filteredTasks = computed(() => allTasks.value.filter((task) => task.type === activeTab.value))
const unfinishedCount = computed(() => filteredTasks.value.filter((task) => !task.completed).length)
const currentTitle = computed(() => tabs.find((tab) => tab.key === activeTab.value)?.label || '打卡')
const currentHint = computed(() => ({
  habit: '每天重复的小事，适合喝水、早睡、阅读、运动。',
  goal: '有周期和方向的目标，适合考试、作品、长期计划。',
  todo: '一次性完成的待办，不和习惯混在一起。',
  review: '今天发生了什么，给自己留一条痕迹。',
}[activeTab.value]))
const placeholder = computed(() => ({
  habit: '例如：晨读 20 分钟',
  goal: '例如：30 天完成作品集',
  todo: '例如：上传最新部署包',
  review: '例如：今天最大的收获',
}[activeTab.value]))

onMounted(async () => {
  plans.value = await listPlans(today).catch(() => [])
})

function showToast(message, type = 'ok') {
  toast.value = message
  toastType.value = type
}

async function addTask() {
  const title = newTask.value.trim()
  if (!title) {
    showToast('先写一点内容吧。', 'error')
    return
  }
  try {
    if (activeTab.value === 'habit') {
      const created = await createPlan(title, today)
      plans.value.unshift(created)
    } else {
      const typeLabel = { goal: '目标', todo: '待办', review: '复盘' }[activeTab.value]
      localTasks.value.unshift({ id: crypto.randomUUID(), title, completed: false, type: activeTab.value, meta: currentHint.value, typeLabel })
    }
    newTask.value = ''
    showToast('已添加')
    pet.value?.say?.('我看到新的打卡啦。')
  } catch (error) {
    showToast(error?.message || '添加失败，请稍后再试。', 'error')
  }
}

async function complete(task) {
  try {
    if (task.type === 'habit') {
      const updated = await togglePlan(task)
      plans.value = plans.value.map((item) => (item.id === updated.id ? updated : item))
      if (updated.completed) pet.value?.poke()
      return
    }
    task.completed = !task.completed
    if (task.completed) pet.value?.poke()
  } catch (error) {
    showToast(error?.message || '操作失败，请稍后再试。', 'error')
  }
}
</script>

<style scoped>
.trace-hero {
  border: 1px solid #dbeafe;
  border-radius: 28px;
  background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(226,242,255,.92));
  padding: 24px;
  box-shadow: 0 18px 55px rgba(37, 99, 235, .12);
}
.trace-hero h1 {
  margin-top: 4px;
  font-size: clamp(32px, 6vw, 58px);
  font-weight: 950;
  color: #0f172a;
}
.trace-hero p:last-child {
  margin-top: 8px;
  color: #64748b;
}
.trace-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: rgba(255,255,255,.84);
  padding: 14px;
  color: #2563eb;
  font-weight: 900;
  box-shadow: 0 8px 22px rgba(37, 99, 235, .08);
}
.trace-tab.active {
  background: #2563eb;
  color: white;
}
.trace-input {
  width: 100%;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: white;
  padding: 14px 16px;
  outline: none;
}
.trace-primary {
  border-radius: 18px;
  background: #2563eb;
  padding: 0 24px;
  color: white;
  font-weight: 900;
}
.check-ring {
  display: grid;
  height: 32px;
  width: 32px;
  place-items: center;
  border: 2px solid #93c5fd;
  border-radius: 999px;
  color: white;
}
.check-ring.done {
  border-color: #2563eb;
  background: #2563eb;
}
</style>
