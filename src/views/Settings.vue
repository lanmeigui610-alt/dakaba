<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <h1 class="mb-5 text-2xl font-bold">设置</h1>
    <section class="card divide-y divide-black/10 dark:divide-white/10">
      <button class="flex w-full items-center justify-between py-4" @click="toggleTheme"><span>主题切换</span><span>{{ settings.theme === 'dark' ? '暗黑' : '日间' }}</span></button>
      <button class="flex w-full items-center justify-between py-4" @click="clearCache"><span>缓存清理</span><Trash2 class="h-5 w-5" /></button>
      <button class="flex w-full items-center justify-between py-4" @click="exportData"><span>数据导出</span><Download class="h-5 w-5" /></button>
      <RouterLink to="/admin" class="flex items-center justify-between py-4"><span>统计面板</span><Shield class="h-5 w-5" /></RouterLink>
      <button class="flex w-full items-center justify-between py-4 text-red-600 dark:text-red-300" @click="logout"><span>退出登录</span><LogOut class="h-5 w-5" /></button>
    </section>
    <p v-if="toast" class="mt-4 rounded-2xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700">{{ toast }}</p>
    <section class="card mt-4">
      <h2 class="font-semibold">关于</h2>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">哒咔Ba 是一个重视私密记录的个人打卡与朋友圈应用。</p>
      <p class="mt-2 text-sm">开发者：MEIGL</p>
    </section>
  </main>
  <PixelPet />
  <BottomNav />
</template>

<script setup>
import { Download, LogOut, Shield, Trash2 } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { supabase } from '../lib/supabase'
import { useSettingsStore } from '../stores/settings'

const settings = useSettingsStore()
const router = useRouter()
const toast = ref('')

function clearCache() {
  localStorage.removeItem('dakaba-draft')
  toast.value = '缓存已清理'
}

function exportData() {
  toast.value = '导出入口已响应，默认不会导出他人的任何私密内容。'
}

function toggleTheme() {
  settings.toggleTheme()
  toast.value = '主题已切换'
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/auth')
}
</script>
