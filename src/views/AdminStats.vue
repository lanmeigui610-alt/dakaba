<template>
  <main class="mx-auto max-w-6xl px-4 py-5">
    <section v-if="!authorized" class="card mx-auto max-w-md">
      <h1 class="text-2xl font-black text-slate-900">管理员验证</h1>
      <p class="mt-2 text-sm text-slate-500">请输入四位管理员密码。</p>
      <input v-model="pin" maxlength="4" type="password" class="mt-4 w-full rounded-2xl border border-blue-100 bg-white px-3 py-3 outline-none focus:border-blue-400" placeholder="默认 2641" @keydown.enter="verify" />
      <p v-if="error" class="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{{ error }}</p>
      <button class="tap mt-4 w-full rounded-2xl bg-blue-500 py-3 font-bold text-white" @click="verify">进入后台</button>
    </section>

    <template v-else>
      <header class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black text-slate-900">管理控制台</h1>
          <p class="text-sm text-slate-500">只显示安全字段，不显示用户密码。</p>
        </div>
        <button class="tap rounded-2xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600" @click="logoutAdmin">退出管理</button>
      </header>

      <section class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="item in cards" :key="item.label" class="card">
          <p class="text-xs text-slate-500">{{ item.label }}</p>
          <p class="mt-2 text-3xl font-black text-blue-600">{{ item.value }}</p>
        </div>
      </section>

      <section class="card mb-4">
        <h2 class="mb-3 font-bold">修改管理员四位密码</h2>
        <div class="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input v-model="oldPin" maxlength="4" type="password" class="rounded-2xl border border-blue-100 bg-white px-3 py-3 outline-none focus:border-blue-400" placeholder="旧密码" />
          <input v-model="newPin" maxlength="4" type="password" class="rounded-2xl border border-blue-100 bg-white px-3 py-3 outline-none focus:border-blue-400" placeholder="新 4 位密码" />
          <button class="tap rounded-2xl bg-blue-500 px-5 py-3 font-bold text-white" @click="changePin">保存</button>
        </div>
        <p v-if="pinMessage" class="mt-3 rounded-2xl bg-green-50 px-3 py-2 text-sm font-bold text-green-700">{{ pinMessage }}</p>
      </section>

      <section class="card overflow-x-auto">
        <h2 class="mb-3 font-bold">用户管理</h2>
        <table class="w-full min-w-[900px] text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="py-2">用户 ID</th>
              <th>邮箱 / 手机号</th>
              <th>昵称</th>
              <th>注册时间</th>
              <th>最后登录时间</th>
              <th>是否封禁</th>
              <th>发布数量</th>
              <th>打卡数量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_id" class="border-t border-blue-50">
              <td class="max-w-[180px] truncate py-3 font-mono text-xs">{{ user.user_id }}</td>
              <td>{{ user.account || '未公开' }}</td>
              <td>{{ user.nickname || '哒咔用户' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ formatDate(user.last_sign_in_at) }}</td>
              <td>
                <button class="rounded-2xl px-3 py-1 text-xs font-bold" :class="user.is_banned ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'" @click="toggleBan(user)">
                  {{ user.is_banned ? '已封禁' : '正常' }}
                </button>
              </td>
              <td>{{ user.moment_count || 0 }}</td>
              <td>{{ user.checkin_count || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getAdminStats, getAdminUsers } from '../api/admin'

const authorized = ref(sessionStorage.getItem('dakaba-admin-ok') === '1')
const pin = ref('')
const oldPin = ref('')
const newPin = ref('')
const error = ref('')
const pinMessage = ref('')
const stats = ref({})
const users = ref([])

const cards = computed(() => [
  { label: '注册总人数', value: stats.value.total_users || users.value.length || 0 },
  { label: '今日活跃', value: stats.value.today_active_users || 0 },
  { label: '总打卡次数', value: stats.value.total_checkins || 0 },
  { label: '存储占用 MB', value: stats.value.storage_mb || 0 },
])

onMounted(load)

async function load() {
  if (!authorized.value) return
  stats.value = await getAdminStats().catch(() => ({}))
  users.value = await getAdminUsers().catch(() => [])
}

function verify() {
  const adminPin = localStorage.getItem('dakaba-admin-pin') || '2641'
  if (pin.value !== adminPin) {
    error.value = '管理员密码不正确。'
    return
  }
  sessionStorage.setItem('dakaba-admin-ok', '1')
  authorized.value = true
  error.value = ''
  load()
}

function changePin() {
  const adminPin = localStorage.getItem('dakaba-admin-pin') || '2641'
  if (oldPin.value !== adminPin) {
    pinMessage.value = '旧密码不正确。'
    return
  }
  if (!/^\d{4}$/.test(newPin.value)) {
    pinMessage.value = '新密码必须是 4 位数字。'
    return
  }
  localStorage.setItem('dakaba-admin-pin', newPin.value)
  pinMessage.value = '管理员密码已修改。'
  oldPin.value = ''
  newPin.value = ''
}

function toggleBan(user) {
  user.is_banned = !user.is_banned
  pinMessage.value = user.is_banned ? '已标记封禁。接入服务端接口后可同步到数据库。' : '已取消封禁标记。'
}

function logoutAdmin() {
  sessionStorage.removeItem('dakaba-admin-ok')
  authorized.value = false
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
</script>
