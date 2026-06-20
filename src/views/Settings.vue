<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <h1 class="mb-5 text-2xl font-bold">设置</h1>
    <section class="card divide-y divide-black/10 dark:divide-white/10">
      <button class="flex w-full items-center justify-between py-4" @click="settings.toggleTheme()"><span>主题切换</span><span>{{ settings.theme === 'dark' ? '暗黑' : '日间' }}</span></button>
      <div class="py-4">
        <div class="mb-3 flex items-center justify-between">
          <span>界面模式</span>
          <MonitorSmartphone class="h-5 w-5" />
        </div>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="mode in displayModes" :key="mode.value" class="tap rounded-lg px-3 py-2 text-sm font-bold" :class="settings.displayMode === mode.value ? 'bg-pixel text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800'" @click="settings.setDisplayMode(mode.value)">
            {{ mode.label }}
          </button>
        </div>
      </div>
      <button class="flex w-full items-center justify-between py-4" @click="clearCache"><span>缓存清理</span><Trash2 class="h-5 w-5" /></button>
      <button class="flex w-full items-center justify-between py-4" @click="exportData"><span>数据导出</span><Download class="h-5 w-5" /></button>
      <RouterLink to="/admin" class="flex items-center justify-between py-4"><span>统计面板</span><Shield class="h-5 w-5" /></RouterLink>
      <button class="flex w-full items-center justify-between py-4 text-red-600 dark:text-red-300" @click="logout"><span>退出登录</span><LogOut class="h-5 w-5" /></button>
    </section>
    <section class="card mt-4">
      <h2 class="font-semibold">关于</h2>
      <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">哒咔Ba 是一个重视私密记录的个人打卡与朋友圈应用。</p>
      <p class="mt-2 text-sm">开发者：MEIGL</p>
    </section>
  </main>
  <BottomNav />
</template>

<script setup>
import { Download, LogOut, MonitorSmartphone, Shield, Trash2 } from '@lucide/vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import { supabase } from '../lib/supabase'
import { useSettingsStore } from '../stores/settings'

const settings = useSettingsStore()
const router = useRouter()
const displayModes = [
  { label: '自动', value: 'auto' },
  { label: '手机', value: 'mobile' },
  { label: '电脑', value: 'desktop' },
]

function clearCache() {
  localStorage.removeItem('dakaba-draft')
}

function exportData() {
  window.alert('请在 Supabase 中启用 Edge Function 后连接导出任务；默认不会导出他人的任何私密内容。')
}

async function logout() {
  await supabase.auth.signOut()
  router.push('/auth')
}
</script>
