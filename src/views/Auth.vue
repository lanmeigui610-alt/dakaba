<template>
  <main class="mx-auto flex min-h-screen max-w-md items-center px-4 py-8">
    <section class="w-full overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft dark:border-white/10 dark:bg-zinc-900">
      <div class="bg-zinc-950 p-5 text-white dark:bg-black">
        <p class="text-sm text-zinc-400">DakaBa</p>
        <h1 class="mt-1 text-3xl font-black">哒咔Ba</h1>
        <p class="mt-2 text-sm text-zinc-300">登录后才能发布朋友圈、上传图片和保存私密记录。</p>
      </div>

      <div class="space-y-3 p-5">
        <div class="grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
          <button class="rounded-lg px-3 py-2 text-sm font-bold" :class="mode === 'signin' ? 'bg-white shadow-sm dark:bg-zinc-950' : ''" @click="mode = 'signin'">登录</button>
          <button class="rounded-lg px-3 py-2 text-sm font-bold" :class="mode === 'signup' ? 'bg-white shadow-sm dark:bg-zinc-950' : ''" @click="mode = 'signup'">注册</button>
        </div>

        <input v-model="phone" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10" placeholder="手机号或邮箱" />
        <input v-model="password" type="password" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10" placeholder="密码" />
        <input v-if="mode === 'signup'" v-model="nickname" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10" placeholder="昵称" />
        <input v-if="mode === 'signup'" v-model="question" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10" placeholder="找回密码问题" />
        <input v-if="mode === 'signup'" v-model="answer" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-3 outline-none dark:border-white/10" placeholder="答案" />

        <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{{ errorMessage }}</p>
        <p v-if="notice" class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">{{ notice }}</p>

        <button class="tap w-full rounded-lg bg-pixel py-3 font-bold text-zinc-950 disabled:opacity-50" :disabled="loading || !phone || !password" @click="submit">
          {{ loading ? '处理中...' : mode === 'signin' ? '登录' : '创建账户' }}
        </button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
    } else {
      await signUpWithPhone({
        phone: phone.value.trim(),
        password: password.value,
        nickname: nickname.value || '哒咔用户',
        securityQuestion: question.value || '默认问题',
        securityAnswer: answer.value || '默认答案',
      })
      notice.value = phone.value.includes('@') ? '注册成功。如果 Supabase 开启了邮箱确认，请先去邮箱确认后再登录。' : '注册成功，可以登录了。'
      mode.value = 'signin'
    }
  } catch (error) {
    const message = error?.message || '操作失败，请稍后再试。'
    if (/phone provider|Unsupported phone|SMS|signup disabled/i.test(message)) {
      errorMessage.value = '当前 Supabase 可能没有开启手机号登录。请先用邮箱注册/登录，或去 Supabase 开启 Phone Auth。'
    } else if (/Invalid login credentials/i.test(message)) {
      errorMessage.value = '账号或密码不正确。'
    } else {
      errorMessage.value = message
    }
  } finally {
    loading.value = false
  }
}
</script>
