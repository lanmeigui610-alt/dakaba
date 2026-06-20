<template>
  <main class="auth-page min-h-screen px-4 py-6">
    <section class="auth-card">
      <div class="brand-panel">
        <div class="brand-mark">Da</div>
        <p class="brand-kicker">DakaBa</p>
        <h1>哒咔Ba</h1>
        <p class="brand-copy">记录日常、完成打卡、发布朋友圈，把私密留给自己，把高光分享出去。</p>
        <div class="feature-list">
          <span>朋友圈</span>
          <span>每日计划</span>
          <span>数日提醒</span>
          <span>心情日记</span>
        </div>
      </div>

      <div class="form-panel">
        <div class="form-head">
          <p>欢迎回来</p>
          <h2>{{ mode === 'signin' ? '登录账户' : '创建账户' }}</h2>
        </div>

        <div class="mode-switch">
          <button :class="{ active: mode === 'signin' }" @click="mode = 'signin'">登录</button>
          <button :class="{ active: mode === 'signup' }" @click="mode = 'signup'">注册</button>
        </div>

        <label>
          <span>手机号或邮箱</span>
          <input v-model="phone" placeholder="请输入手机号或邮箱" autocomplete="username" />
        </label>

        <label>
          <span>密码</span>
          <input v-model="password" type="password" placeholder="请输入密码" autocomplete="current-password" @keydown.enter="submit" />
        </label>

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

        <p v-if="errorMessage" class="notice error">{{ errorMessage }}</p>
        <p v-if="notice" class="notice ok">{{ notice }}</p>

        <button class="primary-btn" :disabled="loading || !phone || !password" @click="submit">
          {{ loading ? '处理中...' : mode === 'signin' ? '登录' : '创建账户' }}
        </button>
      </div>
    </section>

    <PixelPet class="auth-pet" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PixelPet from '../components/PixelPet.vue'
import { signInWithPhone, signUpWithPhone } from '../api/auth'

const router = useRouter()
const route = useRoute()
const mode = ref('signin')
const phone = ref('')
const password = ref('')
const nickname = ref('')
const question = ref('')
const answer = ref('')
const loading = ref(false)
const errorMessage = ref('')
const notice = ref('')

async function submit() {
  errorMessage.value = ''
  notice.value = ''
  loading.value = true
  try {
    if (mode.value === 'signin') {
      await signInWithPhone({ phone: phone.value.trim(), password: password.value })
      router.push(route.query.redirect || '/')
      return
    }

    await signUpWithPhone({
      phone: phone.value.trim(),
      password: password.value,
      nickname: nickname.value || '哒咔用户',
      securityQuestion: question.value || '我最喜欢的花？',
      securityAnswer: answer.value || '蓝色玫瑰',
    })
    notice.value = phone.value.includes('@')
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
      errorMessage.value = '连接 Supabase 失败。请检查网络是否能访问 Supabase，或者确认 Vercel 环境变量 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 已填写。'
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
  background: rgba(255, 255, 255, .82);
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
.primary-btn {
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
  right: 38px;
  bottom: 38px;
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
    right: 16px;
    bottom: 16px;
  }
}
</style>
