<template>
  <main class="safe-bottom mx-auto max-w-7xl px-4 py-5 lg:px-8">
    <section class="home-hero mb-5">
      <div class="hero-copy">
        <p class="hero-kicker">DakaBa Trace</p>
        <h1>把今天，留成一条漂亮的痕迹。</h1>
        <p>朋友圈记录、每日打卡、心情和像素宠物都在这里。少一点复杂，多一点坚持。</p>
        <div class="hero-actions">
          <RouterLink to="/publish" class="primary-action">发朋友圈</RouterLink>
          <RouterLink to="/tasks" class="ghost-action">创建打卡</RouterLink>
        </div>
      </div>
      <div class="hero-panel">
        <div class="pulse-card">
          <span>今日能量</span>
          <strong>{{ progressPercent }}%</strong>
          <div><i :style="{ width: progressPercent + '%' }"></i></div>
        </div>
        <div class="floating-note note-a">公开动态可点赞评论</div>
        <div class="floating-note note-b">私密记录只给自己看</div>
      </div>
    </section>

    <div class="grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
      <section class="card">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 class="text-xl font-black">今日打卡</h2>
            <p class="text-sm text-slate-500">像微信状态一样轻，像打卡软件一样清楚。</p>
          </div>
          <RouterLink to="/tasks" class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-black text-white">管理</RouterLink>
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
          <p v-if="!plans.length" class="rounded-2xl bg-blue-50 px-4 py-6 text-center text-sm font-bold text-blue-700">
            今天还没有打卡，先添加一个小目标吧。
          </p>
        </div>
      </section>

      <aside class="space-y-4">
        <section class="life-grid">
          <RouterLink v-for="item in quickLinks" :key="item.title" :to="item.to" class="life-card">
            <component :is="item.icon" class="h-5 w-5" />
            <span>{{ item.title }}</span>
            <small>{{ item.desc }}</small>
          </RouterLink>
        </section>

        <section class="card">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-black">朋友圈</h2>
            <RouterLink to="/feed" class="text-sm font-black text-blue-600">查看</RouterLink>
          </div>
          <p class="text-sm leading-6 text-slate-500">公开记录可以点赞评论，私密记录只给自己看。发布以后，宠物会读你的内容并给出回应。</p>
        </section>
      </aside>
    </div>
  </main>
  <PixelPet ref="pet" />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { BookOpenText, Check, ImagePlus, ListTodo, Sparkles } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { createPlan, listPlans, togglePlan } from '../api/plans'

const today = new Date().toISOString().slice(0, 10)
const plans = ref([])
const newPlan = ref('')
const toast = ref('')
const toastType = ref('ok')
const pet = ref(null)
const quickLinks = [
  { title: '生活记录', desc: '像每一迹一样留下日常', to: '/tasks', icon: Sparkles },
  { title: '待办事项', desc: '计划、目标、复盘分开管', to: '/tasks', icon: ListTodo },
  { title: '照片动态', desc: '图片/GIF 自动压缩上传', to: '/publish', icon: ImagePlus },
  { title: '日记心情', desc: '表情、心情、私密记录', to: '/calendar', icon: BookOpenText },
]

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
    showToast('已添加今日打卡。')
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
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, .9fr);
  gap: 22px;
  overflow: hidden;
  border: 1px solid #dbeafe;
  border-radius: 34px;
  background:
    radial-gradient(circle at 80% 12%, rgba(125, 211, 252, .45), transparent 26%),
    linear-gradient(135deg, rgba(255,255,255,.97), rgba(226,242,255,.9));
  padding: 30px;
  box-shadow: 0 28px 80px rgba(37, 99, 235, .15);
}
.hero-kicker {
  color: #2563eb;
  font-size: 13px;
  font-weight: 950;
}
.hero-copy h1 {
  margin-top: 8px;
  max-width: 760px;
  color: #0f172a;
  font-size: clamp(38px, 7vw, 76px);
  font-weight: 950;
  line-height: .98;
}
.hero-copy p:last-of-type {
  margin-top: 14px;
  max-width: 600px;
  color: #64748b;
  line-height: 1.8;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}
.primary-action,
.ghost-action,
.trace-primary {
  border-radius: 18px;
  padding: 13px 20px;
  font-weight: 950;
  white-space: nowrap;
}
.primary-action,
.trace-primary {
  background: #2563eb;
  color: white;
  box-shadow: 0 16px 34px rgba(37,99,235,.24);
}
.ghost-action {
  border: 1px solid #bfdbfe;
  background: white;
  color: #2563eb;
}
.hero-panel {
  position: relative;
  min-height: 230px;
}
.pulse-card {
  position: absolute;
  right: 18px;
  top: 20px;
  width: min(280px, 100%);
  border-radius: 28px;
  background: #0f172a;
  padding: 22px;
  color: white;
  box-shadow: 0 24px 55px rgba(15,23,42,.22);
  animation: floaty 4s ease-in-out infinite;
}
.pulse-card span {
  font-weight: 800;
  opacity: .76;
}
.pulse-card strong {
  display: block;
  margin-top: 8px;
  font-size: 62px;
  font-weight: 950;
}
.pulse-card div {
  margin-top: 12px;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255,255,255,.18);
}
.pulse-card i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: #7dd3fc;
  transition: width .5s ease;
}
.floating-note {
  position: absolute;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: rgba(255,255,255,.9);
  padding: 10px 14px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 950;
  box-shadow: 0 14px 35px rgba(37,99,235,.12);
}
.note-a { left: 10px; bottom: 58px; }
.note-b { right: 38px; bottom: 8px; }
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
.life-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.life-card {
  display: grid;
  gap: 8px;
  min-height: 128px;
  border: 1px solid #dbeafe;
  border-radius: 24px;
  background: rgba(255,255,255,.9);
  padding: 16px;
  color: #2563eb;
  box-shadow: 0 14px 34px rgba(37,99,235,.10);
  transition: transform .2s ease, box-shadow .2s ease;
}
.life-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 44px rgba(37,99,235,.16);
}
.life-card span {
  color: #0f172a;
  font-weight: 950;
}
.life-card small {
  color: #64748b;
  line-height: 1.5;
}
@keyframes floaty {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@media (max-width: 860px) {
  .home-hero {
    grid-template-columns: 1fr;
    padding: 24px;
  }
  .hero-panel {
    min-height: 210px;
  }
  .pulse-card {
    left: 0;
    right: auto;
  }
}
@media (max-width: 520px) {
  .life-grid {
    grid-template-columns: 1fr;
  }
  .hero-copy h1 {
    font-size: 40px;
  }
}
</style>
