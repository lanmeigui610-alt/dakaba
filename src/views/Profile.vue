<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <section class="mb-4 overflow-hidden rounded-lg bg-zinc-950 text-white shadow-soft dark:bg-black">
      <div class="bg-[linear-gradient(135deg,#52d273,#38bdf8,#f97316)] p-4">
        <div class="flex items-center gap-3">
          <img :src="form.avatar_url || avatar" class="h-20 w-20 rounded-lg border-4 border-white/40 bg-white object-cover pixelated" alt="" />
          <div class="min-w-0">
            <h1 class="truncate text-2xl font-black">{{ form.nickname || '哒咔用户' }}</h1>
            <p class="mt-1 line-clamp-2 text-sm text-white/90">{{ form.bio || '慢慢来，也要一直往前。' }}</p>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-4 divide-x divide-white/10 p-3 text-center">
        <div v-for="item in stats" :key="item.label">
          <p class="text-xl font-black">{{ item.value }}</p>
          <p class="mt-1 text-[11px] text-zinc-400">{{ item.label }}</p>
        </div>
      </div>
    </section>

    <section class="card mb-4">
      <h2 class="mb-3 font-bold">个人资料</h2>
      <div class="space-y-3">
        <input v-model="form.avatar_url" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" placeholder="头像链接" />
        <input v-model="form.nickname" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" placeholder="昵称" />
        <textarea v-model="form.bio" rows="3" class="w-full resize-none rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" placeholder="个人签名"></textarea>
        <p v-if="message" class="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">{{ message }}</p>
        <button class="tap w-full rounded-lg bg-blue-500 py-3 font-bold text-white disabled:opacity-60" :disabled="saving" @click="save">{{ saving ? '保存中...' : '保存资料' }}</button>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3">
      <RouterLink v-for="item in panels" :key="item.title" :to="item.to" class="card tap min-h-28">
        <component :is="item.icon" class="mb-4 h-6 w-6" :class="item.color" />
        <h3 class="font-bold">{{ item.title }}</h3>
        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{{ item.desc }}</p>
      </RouterLink>
    </section>
  </main>
  <PixelPet />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { CalendarCheck, Images, ListChecks, Settings, Trophy, UserRound } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { supabase } from '../lib/supabase'
import { updateProfile } from '../api/auth'
import { listPlans } from '../api/plans'
import { listMoments } from '../api/feed'

const today = new Date().toISOString().slice(0, 10)
const avatar = 'https://api.dicebear.com/9.x/pixel-art/svg?seed=dakaba-profile'
const form = reactive({ avatar_url: '', nickname: '', bio: '' })
const plans = ref([])
const moments = ref([])
const saving = ref(false)
const message = ref('')

const stats = computed(() => [
  { label: '完成', value: plans.value.filter((item) => item.completed).length },
  { label: '待办', value: plans.value.length },
  { label: '动态', value: moments.value.length },
  { label: '连续', value: 12 },
])

const panels = [
  { title: '累计成就', desc: '查看完成次数和连续天数', to: '/profile', icon: Trophy, color: 'text-yellow-500' },
  { title: '发布记录', desc: '公开与私密动态统计', to: '/feed', icon: Images, color: 'text-cyan-500' },
  { title: '任务记录', desc: '所有打卡与待办', to: '/tasks', icon: ListChecks, color: 'text-green-500' },
  { title: '账号设置', desc: '主题、安全与导出', to: '/settings', icon: Settings, color: 'text-zinc-500' },
]

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
    Object.assign(form, profile || {})
  }
  plans.value = await listPlans(today).catch(() => [])
  moments.value = await listMoments().catch(() => [])
})

async function save() {
  saving.value = true
  message.value = ''
  try {
    const updated = await updateProfile(form)
    Object.assign(form, updated || {})
    message.value = '资料已保存'
  } catch (error) {
    message.value = error?.message || '保存失败，请稍后再试'
  } finally {
    saving.value = false
  }
}
</script>
