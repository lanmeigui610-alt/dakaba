<template>
  <main class="safe-bottom mx-auto max-w-7xl px-4 py-5 lg:px-8">
    <header class="trace-hero mb-5">
      <p class="text-sm font-black text-blue-600">Check-in Studio</p>
      <h1>记录工作台</h1>
      <p>把习惯、计划、待办、资产、订阅、倒数日和复盘分开管理，界面更清楚，点击都有反馈。</p>
    </header>

    <section class="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
      <button v-for="tab in tabs" :key="tab.key" class="trace-tab" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        <component :is="tab.icon" class="h-5 w-5" />
        <span>{{ tab.label }}</span>
      </button>
    </section>

    <section class="card mb-4">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-black">{{ currentTab.label }}</h2>
          <p class="text-sm text-slate-500">{{ currentTab.hint }}</p>
        </div>
        <span class="rounded-2xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{{ unfinishedCount }} 条进行中</span>
      </div>
      <div class="grid gap-2 md:grid-cols-[1fr_auto]">
        <input v-model="newTask" class="trace-input" :placeholder="currentTab.placeholder" @keydown.enter="addTask" />
        <button class="trace-primary" @click="addTask">添加</button>
      </div>
      <p v-if="toast" class="mt-3 rounded-2xl px-3 py-2 text-sm font-bold" :class="toastType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">{{ toast }}</p>
    </section>

    <section class="grid gap-3 lg:grid-cols-2">
      <article v-for="task in filteredTasks" :key="task.id" class="task-card">
        <button class="check-ring" :class="{ done: task.completed }" @click="complete(task)">
          <Check v-if="task.completed" class="h-4 w-4" />
        </button>
        <div class="min-w-0 flex-1">
          <p class="font-black" :class="{ 'line-through opacity-50': task.completed }">{{ task.title }}</p>
          <p class="text-xs text-slate-500">{{ task.meta }}</p>
        </div>
        <span class="rounded-2xl bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{{ task.typeLabel }}</span>
      </article>
      <p v-if="!filteredTasks.length" class="empty-state lg:col-span-2">
        这个分类还没有内容，先添加第一条吧。
      </p>
    </section>
  </main>
  <PixelPet ref="pet" />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Banknote, BookOpenText, CalendarHeart, Check, Flame, ImagePlus, ListTodo, Target, TimerReset } from '@lucide/vue'
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
  { id: 'asset-1', title: '记录本月预算和余额', completed: false, type: 'asset', meta: '资产记录', typeLabel: '资产' },
  { id: 'sub-1', title: '检查会员续费日期', completed: false, type: 'subscription', meta: '订阅提醒', typeLabel: '订阅' },
])

const tabs = [
  { key: 'habit', label: '习惯', icon: Flame, hint: '每天重复的小事，适合喝水、早睡、阅读、运动。', placeholder: '例如：晨读 20 分钟' },
  { key: 'goal', label: '目标', icon: Target, hint: '有周期和方向的目标，适合考试、作品、长期计划。', placeholder: '例如：30 天完成作品集' },
  { key: 'todo', label: '待办', icon: ListTodo, hint: '一次性完成的待办，不和习惯混在一起。', placeholder: '例如：上传最新部署包' },
  { key: 'review', label: '复盘', icon: TimerReset, hint: '今天发生了什么，给自己留一条痕迹。', placeholder: '例如：今天最大的收获' },
  { key: 'asset', label: '资产', icon: Banknote, hint: '记录收入、支出、余额、预算和大件物品。', placeholder: '例如：本月预算还剩 800' },
  { key: 'subscription', label: '订阅', icon: CalendarHeart, hint: '记录会员、软件、课程续费提醒。', placeholder: '例如：云盘会员 7 月 1 日续费' },
  { key: 'diary', label: '日记', icon: BookOpenText, hint: '写给自己的日常片段，可配合心情记录。', placeholder: '例如：今天下雨但心情很好' },
  { key: 'photo', label: '照片', icon: ImagePlus, hint: '整理相册、贴纸、截图和待发布图片。', placeholder: '例如：整理蓝色玫瑰照片' },
]

const currentTab = computed(() => tabs.find((tab) => tab.key === activeTab.value) || tabs[0])
const habitTasks = computed(() => plans.value.map((plan) => ({ ...plan, type: 'habit', meta: '每日重复', typeLabel: '习惯' })))
const allTasks = computed(() => [...habitTasks.value, ...localTasks.value])
const filteredTasks = computed(() => allTasks.value.filter((task) => task.type === activeTab.value))
const unfinishedCount = computed(() => filteredTasks.value.filter((task) => !task.completed).length)

onMounted(async () => {
  plans.value = await listPlans(today).catch(() => [])
  const saved = localStorage.getItem('dakaba-local-tasks')
  if (saved) {
    try {
      localTasks.value = JSON.parse(saved)
    } catch {}
  }
})

function saveLocalTasks() {
  localStorage.setItem('dakaba-local-tasks', JSON.stringify(localTasks.value))
}

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
      localTasks.value.unshift({
        id: crypto.randomUUID(),
        title,
        completed: false,
        type: activeTab.value,
        meta: currentTab.value.hint,
        typeLabel: currentTab.value.label,
      })
      saveLocalTasks()
    }
    newTask.value = ''
    showToast('已添加。')
    pet.value?.say?.('我看到新的记录啦。')
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
    saveLocalTasks()
    if (task.completed) pet.value?.poke()
  } catch (error) {
    showToast(error?.message || '操作失败，请稍后再试。', 'error')
  }
}
</script>

<style scoped>
.trace-hero {
  border: 1px solid #dbeafe;
  border-radius: 30px;
  background:
    radial-gradient(circle at 85% 18%, rgba(125,211,252,.5), transparent 24%),
    linear-gradient(135deg, rgba(255,255,255,.96), rgba(226,242,255,.92));
  padding: 26px;
  box-shadow: 0 20px 62px rgba(37, 99, 235, .14);
}
.trace-hero h1 {
  margin-top: 4px;
  color: #0f172a;
  font-size: clamp(34px, 6vw, 62px);
  font-weight: 950;
}
.trace-hero p:last-child {
  margin-top: 8px;
  color: #64748b;
}
.trace-tab {
  display: flex;
  min-height: 76px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #dbeafe;
  border-radius: 20px;
  background: rgba(255,255,255,.9);
  padding: 12px;
  color: #2563eb;
  font-weight: 950;
  box-shadow: 0 10px 24px rgba(37, 99, 235, .09);
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.trace-tab:hover {
  transform: translateY(-2px);
}
.trace-tab.active {
  background: #2563eb;
  color: white;
  box-shadow: 0 16px 34px rgba(37, 99, 235, .25);
}
.trace-input {
  width: 100%;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: white;
  padding: 14px 16px;
  outline: none;
}
.trace-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
}
.trace-primary {
  border-radius: 18px;
  background: #2563eb;
  padding: 0 24px;
  color: white;
  font-weight: 950;
  box-shadow: 0 16px 32px rgba(37,99,235,.22);
}
.task-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #dbeafe;
  border-radius: 24px;
  background: rgba(255,255,255,.9);
  padding: 14px;
  box-shadow: 0 12px 32px rgba(37,99,235,.09);
}
.check-ring {
  display: grid;
  height: 34px;
  width: 34px;
  flex: none;
  place-items: center;
  border: 2px solid #93c5fd;
  border-radius: 999px;
  color: white;
}
.check-ring.done {
  border-color: #2563eb;
  background: #2563eb;
}
.empty-state {
  border: 1px dashed #93c5fd;
  border-radius: 24px;
  background: rgba(239,246,255,.7);
  padding: 28px;
  text-align: center;
  color: #2563eb;
  font-weight: 900;
}
</style>
