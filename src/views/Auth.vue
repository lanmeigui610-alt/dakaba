<template>
  <main class="auth-page min-h-screen px-4 py-6">
    <section class="auth-card">
      <div class="brand-panel">
        <div class="brand-mark">Da</div>
        <p class="brand-kicker">DakaBa</p>
        <h1>哒咔Ba</h1>
        <p class="brand-copy">像微信一样轻松记录，像每日痕迹一样安静陪伴。打卡、日记、朋友圈和私密记录都在这里。</p>
        <div class="feature-list">
          <span>朋友圈</span>
          <span>每日计划</span>
          <span>数日提醒</span>
          <span>心情日记</span>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-head">
          <p>{{ modeTitle.kicker }}</p>
          <h2>{{ modeTitle.title }}</h2>
        </div>

        <div class="mode-switch">
          <button :class="{ active: mode === 'signin' }" type="button" @click="mode = 'signin'">登录</button>
          <button :class="{ active: mode === 'signup' }" type="button" @click="mode = 'signup'">注册</button>
        </div>

        <label v-if="mode !== 'reset'">
          <span>{{ mode === 'recover' ? '注册邮箱' : mode === 'admin' ? '管理员四位密码' : '手机号或邮箱' }}</span>
          <input v-model="account" :type="mode === 'admin' ? 'password' : 'text'" :maxlength="mode === 'admin' ? 4 : undefined" :placeholder="mode === 'recover' ? '请输入注册邮箱' : mode === 'admin' ? '请输入 4 位管理员密码' : '请输入手机号或邮箱'" autocomplete="username" />
        </label>

        <label v-if="mode !== 'recover' && mode !== 'admin' && mode !== 'reset'">
          <span>密码</span>
          <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" @keydown.enter="submit" />
        </label>

        <template v-if="mode === 'reset'">
          <label>
            <span>新密码</span>
            <input v-model="newPassword" type="password" placeholder="请输入新密码" />
          </label>
          <label>
            <span>确认新密码</span>
            <input v-model="confirmPassword" type="password" placeholder="再次输入新密码" @keydown.enter="submit" />
          </label>
        </template>

        <template v-if="mode === 'signup'">
          <label>
            <span>昵称</span>
            <input v-model="nickname" placeholder="给自己取个名字" />
          </label>
          <label>
            <span>找回密码问题</span>
            <input v-model="question" placeholder="例如：我最喜欢的花？" />
          </label>
          <label>
            <span>答案</span>
            <input v-model="answer" placeholder="用于找回密码" />
          </label>
        </template>

        <template v-if="mode === 'recover'">
          <label>
            <span>你注册时设置的问题</span>
            <input v-model="question" placeholder="例如：我最喜欢的花？" />
          </label>
          <label>
            <span>答案</span>
            <input v-model="answer" placeholder="回答正确后，请按邮件链接重设密码" />
          </label>
        </template>

        <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>
        <p v-if="notice" class="notice ok">{{ notice }}</p>

        <button class="primary-btn" :disabled="loading || !canSubmit" type="button" @click="submit">
          {{ submitLabel }}
        </button>

        <div class="form-actions">
          <button type="button" @click="mode = 'recover'">找回密码</button>
          <button type="button" @click="mode = 'admin'">管理员登录</button>
        </div>
      </div>
    </section>

    <PixelPet class="auth-pet" />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PixelPet from '../components/PixelPet.vue'
import { signInWithPhone, signUpWithPhone, sendPasswordReset, updatePassword } from '../api/auth'

const router = useRouter()
const route = useRoute()
const mode = ref('signin')
const account = ref('')
const password = ref('')
const nickname = ref('')
const question = ref('')
const answer = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const notice = ref('')

const modeTitle = computed(() => ({
  signin: { kicker: '欢迎回来', title: '登录账户' },
  signup: { kicker: '第一次见面', title: '创建账户' },
  recover: { kicker: '别着急', title: '找回密码' },
  reset: { kicker: '重新开始', title: '设置新密码' },
  admin: { kicker: '管理入口', title: '管理员登录' },
}[mode.value]))

const submitLabel = computed(() => {
  if (loading.value) return '处理中...'
  if (mode.value === 'signup') return '创建账户'
  if (mode.value === 'recover') return '发送重置邮件'
  if (mode.value === 'reset') return '保存新密码'
  if (mode.value === 'admin') return '管理员登录'
  return '登录'
})

const canSubmit = computed(() => {
  if (mode.value === 'recover') return account.value && question.value && answer.value
  if (mode.value === 'reset') return newPassword.value && confirmPassword.value
  if (mode.value === 'admin') return account.value.length === 4
  return account.value && password.value
})

onMounted(() => {
  const hash = window.location.hash
  const search = window.location.search
  if (hash.includes('type=recovery') || search.includes('type=recovery') || hash.includes('access_token')) {
    mode.value = 'reset'
  }
})

async function submit() {
  errorMessage.value = ''
  notice.value = ''
  loading.value = true
  try {
    if (mode.value === 'recover') {
      await sendPasswordReset(account.value.trim())
      notice.value = '已发送重置密码邮件。请打开邮箱链接重设密码；安全问题用于确认你本人在操作。'
      return
    }

    if (mode.value === 'reset') {
      if (newPassword.value !== confirmPassword.value) throw new Error('两次输入的新密码不一致。')
      await updatePassword(newPassword.value)
      notice.value = '新密码已保存，可以直接用新密码登录。'
      mode.value = 'signin'
      password.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      return
    }

    if (mode.value === 'admin') {
      const adminPin = localStorage.getItem('dakaba-admin-pin') || '2641'
      if (account.value !== adminPin) throw new Error('管理员密码不正确。')
      sessionStorage.setItem('dakaba-admin-ok', '1')
      router.push('/admin')
      return
    }

    if (mode.value === 'signin') {
      await signInWithPhone({ phone: account.value.trim(), password: password.value })
      router.push(mode.value === 'admin' ? '/admin' : route.query.redirect || '/')
      return
    }

    await signUpWithPhone({
      phone: account.value.trim(),
      password: password.value,
      nickname: nickname.value || '哒咔用户',
      securityQuestion: question.value || '我最喜欢的花？',
      securityAnswer: answer.value || '蓝色玫瑰',
    })
    notice.value = account.value.includes('@')
      ? '注册成功。如果开启了邮箱确认，请先去邮箱确认后再登录。'
      : '注册成功，可以登录了。'
    mode.value = 'signin'
  } catch (error) {
    const message = error?.message || '操作失败，请稍后再试。'
    if (/phone provider|Unsupported phone|SMS|signup disabled/i.test(message)) {
      errorMessage.value = '当前 Supabase 可能没有开启手机号登录。请先用邮箱注册/登录，或去 Supabase 开启 Phone Auth。'
    } else if (/Invalid login credentials/i.test(message)) {
      errorMessage.value = '账号或密码不正确。'
    } else if (/Failed to fetch|fetch|取物失败|Load failed|NetworkError/i.test(message)) {
      errorMessage.value = '连接 Supabase 失败。请检查网络或 Vercel 环境变量。'
    } else {
      errorMessage.value = message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 16% 18%, rgba(80, 157, 255, .22), transparent 28%),
    radial-gradient(circle at 84% 16%, rgba(119, 201, 255, .30), transparent 26%),
    linear-gradient(135deg, #f8fbff 0%, #eef6ff 48%, #ffffff 100%);
}
.auth-card {
  width: min(1040px, 100%);
  min-height: 640px;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  overflow: hidden;
  border: 1px solid rgba(37, 99, 235, .12);
  border-radius: 28px;
  background: rgba(255, 255, 255, .84);
  box-shadow: 0 26px 80px rgba(37, 99, 235, .18);
  backdrop-filter: blur(24px);
}
.brand-panel {
  position: relative;
  padding: 54px;
  color: white;
  background:
    radial-gradient(circle at 78% 20%, rgba(255, 255, 255, .28), transparent 20%),
    linear-gradient(145deg, #1677ff 0%, #4aa3ff 48%, #86c8ff 100%);
}
.brand-panel::after {
  content: "";
  position: absolute;
  right: -80px;
  bottom: -80px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 42px solid rgba(255, 255, 255, .18);
}
.brand-mark {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 18px;
  background: white;
  color: #1677ff;
  font-weight: 900;
  box-shadow: 0 14px 34px rgba(0, 65, 160, .24);
}
.brand-kicker {
  margin-top: 58px;
  font-size: 14px;
  opacity: .78;
}
h1 {
  margin: 8px 0 0;
  font-size: clamp(48px, 7vw, 82px);
  line-height: .96;
  font-weight: 900;
}
.brand-copy {
  margin-top: 20px;
  max-width: 420px;
  color: rgba(255, 255, 255, .86);
  line-height: 1.8;
}
.feature-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 34px;
}
.feature-list span {
  border-radius: 999px;
  background: rgba(255, 255, 255, .18);
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
}
.form-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  padding: 46px;
}
.form-head p {
  color: #4b83c4;
  font-size: 14px;
  font-weight: 800;
}
.form-head h2 {
  margin-top: 4px;
  color: #102a43;
  font-size: 32px;
  font-weight: 900;
}
.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  border-radius: 16px;
  background: #eef6ff;
  padding: 6px;
}
.mode-switch button,
.primary-btn,
.form-actions button {
  cursor: pointer;
}
.mode-switch button {
  border: 0;
  border-radius: 12px;
  background: transparent;
  padding: 12px;
  color: #51708f;
  font-weight: 900;
}
.mode-switch .active {
  background: white;
  color: #1677ff;
  box-shadow: 0 8px 22px rgba(22, 119, 255, .14);
}
label span {
  display: block;
  margin-bottom: 8px;
  color: #47627d;
  font-size: 13px;
  font-weight: 800;
}
input {
  width: 100%;
  border: 1px solid #d8e7f8;
  border-radius: 16px;
  background: #f8fbff;
  padding: 14px 15px;
  color: #102a43;
  outline: none;
  transition: .2s;
}
input:focus {
  border-color: #1677ff;
  background: white;
  box-shadow: 0 0 0 4px rgba(22, 119, 255, .12);
}
.primary-btn {
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #1677ff, #53b6ff);
  padding: 15px;
  color: white;
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 14px 32px rgba(22, 119, 255, .28);
}
.primary-btn:disabled {
  cursor: not-allowed;
  opacity: .55;
}
.form-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.form-actions button {
  border: 0;
  background: transparent;
  color: #1677ff;
  font-weight: 800;
}
.notice {
  border-radius: 14px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
}
.notice.error {
  background: #fff1f2;
  color: #be123c;
}
.notice.ok {
  background: #ecfdf5;
  color: #047857;
}
:deep(.auth-pet.pet-wrap) {
  left: min(70vw, calc(50% + 350px));
  top: 120px;
}
@media (max-width: 820px) {
  .auth-page {
    align-items: start;
  }
  .auth-card {
    min-height: 0;
    grid-template-columns: 1fr;
    border-radius: 24px;
  }
  .brand-panel {
    padding: 30px;
  }
  .brand-kicker {
    margin-top: 28px;
  }
  .form-panel {
    padding: 24px;
  }
  :deep(.auth-pet.pet-wrap) {
    left: auto;
    right: 44px;
    top: 112px;
  }
}
</style>
