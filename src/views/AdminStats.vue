<template>
  <main class="safe-bottom mx-auto max-w-7xl px-4 py-5 lg:px-8">
    <section v-if="!authorized" class="admin-login mx-auto max-w-md">
      <p class="text-sm font-black text-blue-600">DakaBa Admin</p>
      <h1>管理员登录</h1>
      <p>输入四位数密码进入后台。后台只显示安全字段，不会显示用户密码。</p>
      <input
        v-model="pin"
        maxlength="4"
        inputmode="numeric"
        type="password"
        class="admin-input mt-5"
        placeholder="默认 2641"
        @keydown.enter="verify"
      />
      <p v-if="error" class="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{{ error }}</p>
      <button class="tap mt-4 w-full rounded-2xl bg-blue-600 py-3 font-black text-white shadow-blue" @click="verify">进入控制台</button>
    </section>

    <template v-else>
      <header class="admin-hero mb-5">
        <div>
          <p class="text-sm font-black text-blue-100">DakaBa Admin Center</p>
          <h1>用户安全控制台</h1>
          <p>查看注册、活跃、发布和打卡数据；封禁后用户不能发布公开朋友圈。</p>
        </div>
        <button class="tap rounded-2xl bg-white/15 px-4 py-2 text-sm font-black text-white" @click="logoutAdmin">退出</button>
      </header>

      <section class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div v-for="item in cards" :key="item.label" class="stat-card">
          <p>{{ item.label }}</p>
          <strong>{{ item.value }}</strong>
        </div>
      </section>

      <section class="card mb-4">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-black">管理密码</h2>
            <p class="text-sm text-slate-500">可在本浏览器修改四位数后台入口密码。</p>
          </div>
          <button class="tap rounded-2xl bg-blue-50 px-4 py-2 text-sm font-black text-blue-700" @click="load">刷新数据</button>
        </div>
        <div class="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input v-model="oldPin" maxlength="4" type="password" class="admin-input" placeholder="旧密码" />
          <input v-model="newPin" maxlength="4" type="password" class="admin-input" placeholder="新 4 位密码" />
          <button class="tap rounded-2xl bg-blue-600 px-5 py-3 font-black text-white" @click="changePin">保存</button>
        </div>
        <p v-if="message" class="mt-3 rounded-2xl px-3 py-2 text-sm font-bold" :class="messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'">{{ message }}</p>
      </section>

      <section class="card overflow-x-auto">
        <div class="mb-3 flex items-center justify-between gap-3">
          <h2 class="text-lg font-black">用户管理</h2>
          <span class="rounded-2xl bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{{ users.length }} 位用户</span>
        </div>
        <table class="w-full min-w-[940px] text-left text-sm">
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
              <td class="max-w-[190px] truncate py-3 font-mono text-xs">{{ user.user_id }}</td>
              <td>{{ user.account || '未公开' }}</td>
              <td>{{ user.nickname || '哒咔用户' }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
              <td>{{ formatDate(user.last_sign_in_at) }}</td>
              <td>
                <button
                  class="tap rounded-2xl px-3 py-1 text-xs font-black"
                  :class="user.is_banned ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'"
                  @click="toggleBan(user)"
                >
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
import { getAdminStats, getAdminUsers, setUserBan } from '../api/admin'

const authorized = ref(sessionStorage.getItem('dakaba-admin-ok') === '1')
const pin = ref('')
const oldPin = ref('')
const newPin = ref('')
const error = ref('')
const message = ref('')
const messageType = ref('ok')
const stats = ref({})
const users = ref([])

const activePin = computed(() => localStorage.getItem('dakaba-admin-pin') || '2641')
const cards = computed(() => [
  { label: '注册总人数', value: stats.value.total_users || users.value.length || 0 },
  { label: '今日活跃', value: stats.value.today_active_users || 0 },
  { label: '总打卡次数', value: stats.value.total_checkins || 0 },
  { label: '存储占用 MB', value: stats.value.storage_mb || 0 },
])

onMounted(load)

async function load() {
  if (!authorized.value) return
  try {
    stats.value = await getAdminStats(activePin.value).catch(() => ({}))
    users.value = await getAdminUsers(activePin.value)
  } catch (err) {
    showMessage(err?.message || '后台数据读取失败，请确认 Supabase 已执行最新 SQL。', 'error')
  }
}

function verify() {
  if (pin.value !== activePin.value) {
    error.value = '管理员密码不正确。'
    return
  }
  sessionStorage.setItem('dakaba-admin-ok', '1')
  authorized.value = true
  error.value = ''
  load()
}

function showMessage(text, type = 'ok') {
  message.value = text
  messageType.value = type
}

function changePin() {
  if (oldPin.value !== activePin.value) {
    showMessage('旧密码不正确。', 'error')
    return
  }
  if (!/^\d{4}$/.test(newPin.value)) {
    showMessage('新密码必须是 4 位数字。', 'error')
    return
  }
  localStorage.setItem('dakaba-admin-pin', newPin.value)
  showMessage('管理员密码已修改。')
  oldPin.value = ''
  newPin.value = ''
}

async function toggleBan(user) {
  const next = !user.is_banned
  const oldValue = user.is_banned
  user.is_banned = next
  try {
    await setUserBan(user.user_id, next, activePin.value)
    showMessage(next ? '已封禁：该用户不能发布公开朋友圈。' : '已解除封禁。')
  } catch (err) {
    user.is_banned = oldValue
    showMessage(err?.message || '封禁操作失败，请先执行最新 Supabase SQL。', 'error')
  }
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

<style scoped>
.admin-login,
.admin-hero,
.stat-card {
  border: 1px solid #dbeafe;
  border-radius: 30px;
  background: rgba(255,255,255,.92);
  box-shadow: 0 22px 70px rgba(37,99,235,.14);
}
.admin-login {
  padding: 28px;
}
.admin-login h1,
.admin-hero h1 {
  margin-top: 6px;
  color: #0f172a;
  font-size: clamp(32px, 6vw, 58px);
  font-weight: 950;
}
.admin-login p:last-of-type {
  margin-top: 8px;
  color: #64748b;
}
.admin-hero {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  padding: 28px;
  color: white;
}
.admin-hero h1 {
  color: white;
}
.admin-hero p {
  color: rgba(255,255,255,.86);
}
.admin-input {
  width: 100%;
  border: 1px solid #bfdbfe;
  border-radius: 18px;
  background: white;
  padding: 13px 15px;
  outline: none;
}
.admin-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37,99,235,.12);
}
.stat-card {
  padding: 18px;
}
.stat-card p {
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}
.stat-card strong {
  display: block;
  margin-top: 8px;
  color: #2563eb;
  font-size: 32px;
  font-weight: 950;
}
.shadow-blue {
  box-shadow: 0 16px 34px rgba(37,99,235,.26);
}
@media (max-width: 720px) {
  .admin-hero {
    align-items: start;
    flex-direction: column;
  }
}
</style>
