<template>
  <main class="mx-auto flex min-h-screen max-w-md items-center px-4">
    <section class="card w-full space-y-3">
      <h1 class="text-2xl font-bold">登录哒咔Ba</h1>
      <input v-model="phone" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" placeholder="手机号" />
      <input v-model="password" type="password" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" placeholder="密码" />
      <input v-if="mode === 'signup'" v-model="nickname" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" placeholder="昵称" />
      <input v-if="mode === 'signup'" v-model="question" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" placeholder="找回密码问题" />
      <input v-if="mode === 'signup'" v-model="answer" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" placeholder="答案" />
      <button class="tap w-full rounded-lg bg-pixel py-3 font-bold text-zinc-950" @click="submit">{{ mode === 'signin' ? '登录' : '注册' }}</button>
      <button class="text-sm text-zinc-500" @click="mode = mode === 'signin' ? 'signup' : 'signin'">{{ mode === 'signin' ? '创建账户' : '已有账户，去登录' }}</button>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithPhone, signUpWithPhone } from '../api/auth'

const router = useRouter()
const mode = ref('signin')
const phone = ref('')
const password = ref('')
const nickname = ref('')
const question = ref('')
const answer = ref('')

async function submit() {
  if (mode.value === 'signin') {
    await signInWithPhone({ phone: phone.value, password: password.value })
  } else {
    await signUpWithPhone({
      phone: phone.value,
      password: password.value,
      nickname: nickname.value,
      securityQuestion: question.value,
      securityAnswer: answer.value,
    })
  }
  router.push('/')
}
</script>
