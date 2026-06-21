<template>
  <main class="safe-bottom mx-auto px-4 py-5 lg:px-8">
    <section class="home-hero mb-5">
      <div>
        <p class="text-sm font-black text-blue-500">DakaBa Trace</p>
        <h1>今天留下什么痕迹？</h1>
        <p>专注打卡、朋友圈记录和像素宠物陪伴。少一点复杂，多一点坚持。</p>
      </div>
      <RouterLink to="/publish" class="hero-action">发朋友圈</RouterLink>
    </section>

    <div class="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <section class="card">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-black">今日打卡</h2>
            <p class="text-sm text-slate-500">像微信状态一样轻，像打卡软件一样清楚。</p>
          </div>
          <RouterLink to="/tasks" class="rounded-2xl bg-blue-500 px-4 py-2 text-sm font-bold text-white">管理</RouterLink>
        </div>

        <div class="mb-4 grid grid-cols-3 gap-3">
          <div class="metric">
            <p>完成</p>
            <strong>{{ completedCount }}</strong>
          </div>
          <div class="metric">
            <p>待完成</p>
            <strong>{{ Math.max(0, plans.length - completedCount) }}</strong>
          </div>
          <div class="metric">
            <p>完成率</p>
            <strong>{{ progressPercent }}%</strong>
          </div>
        </div>

        <div class="mb-3 flex gap-2">
          <input v-model="newPlan" class="trace-input" placeholder="快速添加一个今日打卡" @keydown.enter="addPlan" />
          <button class="trace-primary" @click="addPlan">添加</button>
        </div>
        <p v-if="toast" class="mb-3 rounded-2xl px-3 py-2 text-sm font-bold" :class="toastType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">{{ toast }}</p>

        <div class="space-y-2">
          <article v-for="plan in plans" :key="plan.id" class="check-card">
            <button class="check-ring" :class="{ done: plan.completed }" @click="complete(plan)">
              <Check v-if="plan.completed" class="h-4 w-4" />
            </button>
            <span :class="{ 'line-through opacity-50': plan.completed }">{{ plan.title }}</span>
          </article>
        </div>
      </section>

      <aside class="space-y-4">
        <section class="energy-card">
          <p>今日能量</p>
          <strong>{{ progressPercent }}%</strong>
          <div><span :style="{ width: progressPercent + '%' }"></span></div>
        </section>

        <section class="card">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-black">朋友圈</h2>
            <RouterLink to="/feed" class="text-sm font-bold text-blue-600">查看</RouterLink>
          </div>
          <p class="text-sm text-slate-500">公开记录可以点赞评论，私密记录只给自己看。宠物会读你的朋友圈并回应。</p>
        </section>
      </aside>
    </div>
  </main>
  <PixelPet ref="pet" />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Check } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { createPlan, listPlans, togglePlan } from '../api/plans'

const today = new Date().toISOString().slice(0, 10)
const plans = ref([])
const newPlan = ref('')
const toast = ref('')
const toastType = ref('ok')
const pet = ref(null)

const completedCount = computed(() => plans.value.filter((plan) => plan.completed).length)
const progressPercent = computed(() => plans.value.length ? Math.round((completedCount.value / plans.value.length) * 100) : 0)

onMounted(async () => {
  plans.value = await listPlans(today).catch(() => [])
})

function showToast(message, type = 'ok') {
  toast.value = message
  toastType.value = type
}

async function addPlan() {
  const title = newPlan.value.trim()
  if (!title) {
    showToast('先写一点打卡内容吧。', 'error')
    return
  }
  try {
    const created = await createPlan(title, today)
    plans.value.unshift(created)
    newPlan.value = ''
    showToast('已添加今日打卡')
    pet.value?.say?.('新的打卡已经种下啦。')
  } catch (error) {
    showToast(error?.message || '添加失败，请稍后再试。', 'error')
  }
}

async function complete(plan) {
  try {
    const updated = await togglePlan(plan)
    plans.value = plans.value.map((item) => (item.id === updated.id ? updated : item))
    if (updated.completed) pet.value?.poke()
  } catch (error) {
    showToast(error?.message || '操作失败，请稍后再试。', 'error')
  }
}
</script>

<style scoped>
.home-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid #dbeafe;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(255,255,255,.96), rgba(226,242,255,.9));
  padding: 28px;
  box-shadow: 0 22px 70px rgba(37, 99, 235, .14);
}
.home-hero h1 {
  margin-top: 6px;
  font-size: clamp(34px, 6vw, 64px);
  font-weight: 950;
  color: #0f172a;
}
.home-hero p:last-child {
  margin-top: 8px;
  color: #64748b;
}
.hero-action,
.trace-primary {
  border-radius: 18px;
  background: #2563eb;
  padding: 13px 20px;
  color: white;
  font-weight: 900;
  white-space: nowrap;
}
.metric {
  border-radius: 22px;
  background: #eff6ff;
  padding: 14px;
}
.metric p {
  font-size: 12px;
  color: #64748b;
}
.metric strong {
  display: block;
  margin-top: 4px;
  color: #2563eb;
  font-size: 28px;
  font-weight: 950;
}
.trace-input {
  min-width: 0;
  flex: 1;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: white;
  padding: 13px 15px;
  outline: none;
}
.check-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  background: rgba(239, 246, 255, .78);
  padding: 12px;
  font-weight: 800;
}
.check-ring {
  display: grid;
  height: 30px;
  width: 30px;
  place-items: center;
  border: 2px solid #93c5fd;
  border-radius: 999px;
  color: white;
}
.check-ring.done {
  border-color: #2563eb;
  background: #2563eb;
}
.energy-card {
  border-radius: 30px;
  background: linear-gradient(135deg, #2563eb, #7dd3fc);
  padding: 24px;
  color: white;
  box-shadow: 0 22px 70px rgba(37, 99, 235, .18);
}
.energy-card p {
  font-weight: 800;
  opacity: .85;
}
.energy-card strong {
  display: block;
  margin-top: 6px;
  font-size: 64px;
  font-weight: 950;
}
.energy-card div {
  margin-top: 14px;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255,255,255,.35);
}
.energy-card span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: white;
  transition: width .5s ease;
}
@media (max-width: 720px) {
  .home-hero {
    align-items: start;
    flex-direction: column;
  }
}
</style>
