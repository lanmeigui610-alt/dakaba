<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <header class="mb-5">
      <h1 class="text-2xl font-black">发布记录</h1>
      <p class="text-sm text-zinc-500 dark:text-zinc-400">先选隐私，再写内容。公开可评论点赞，私密只自己可见。</p>
    </header>

    <form class="space-y-4" @submit.prevent="submit">
      <section class="card">
        <h2 class="mb-3 font-bold">隐私</h2>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" :class="visibilityClass('private')" @click="visibility = 'private'">
            <Lock class="h-4 w-4" />私密
          </button>
          <button type="button" :class="visibilityClass('public')" @click="visibility = 'public'">
            <Globe2 class="h-4 w-4" />公开
          </button>
        </div>
      </section>

      <section class="card">
        <h2 class="mb-3 font-bold">文字</h2>
        <textarea v-model="body" rows="7" class="w-full resize-none rounded-lg border border-black/10 bg-transparent p-3 outline-none dark:border-white/10" placeholder="这一刻想记录什么？"></textarea>
      </section>

      <section class="card">
        <h2 class="mb-3 font-bold">图片 / GIF</h2>
        <label class="block rounded-lg border border-dashed border-black/20 p-4 text-center dark:border-white/20">
          <ImagePlus class="mx-auto mb-2 h-6 w-6" />
          <span class="text-sm">添加图片，发布时自动压缩为 WebP</span>
          <input class="hidden" type="file" multiple accept="image/*,.gif" @change="files = $event.target.files" />
        </label>
        <p v-if="files?.length" class="mt-2 text-xs text-zinc-500">已选择 {{ files.length }} 个文件</p>
        <p class="mt-2 text-xs text-zinc-500 dark:text-zinc-400">单张图片会压缩到 500KB 内；GIF 需要本身小于 500KB。</p>
      </section>

      <section class="card grid gap-3">
        <h2 class="font-bold">标签与心情</h2>
        <input v-model="tagText" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" placeholder="标签，用逗号分隔，如 学习,生活" />
        <input v-model="mood" class="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none dark:border-white/10" placeholder="心情，如 开心、平静、🌙" />
      </section>

      <p v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
        {{ errorMessage }}
      </p>
      <p v-if="successMessage" class="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
        {{ successMessage }}
      </p>

      <button class="tap w-full rounded-lg bg-pixel py-3 font-bold text-zinc-950 disabled:opacity-50" :disabled="saving || !body.trim() || !visibility">
        {{ saving ? '发布中...' : '发布' }}
      </button>
    </form>
  </main>
  <BottomNav />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Globe2, ImagePlus, Lock } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import { createMoment } from '../api/feed'

const router = useRouter()
const body = ref('')
const files = ref([])
const visibility = ref('private')
const tagText = ref('')
const mood = ref('')
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

function visibilityClass(value) {
  return [
    'tap flex items-center justify-center gap-2 rounded-lg border px-3 py-3 font-semibold',
    visibility.value === value ? 'border-pixel bg-pixel text-zinc-950' : 'border-black/10 dark:border-white/10',
  ]
}

async function submit() {
  if (!body.value.trim() || !visibility.value) return
  errorMessage.value = ''
  successMessage.value = ''
  saving.value = true
  try {
    await createMoment({
      body: body.value,
      mediaFiles: files.value,
      visibility: visibility.value,
      mood: mood.value,
      tags: tagText.value.split(/[,，]/).map((item) => item.trim()).filter(Boolean),
    })
    successMessage.value = '发布成功'
    router.push('/feed')
  } catch (error) {
    const message = error?.message || '发布失败，请稍后再试。'
    if (/Auth session missing|JWT|请先登录|not authenticated/i.test(message)) {
      errorMessage.value = '请先登录/注册，再发布朋友圈。'
    } else if (/bucket|Storage|moment-media|row-level security|policy/i.test(message)) {
      errorMessage.value = '图片上传失败：请确认 Supabase 已执行 schema.sql，并创建 moment-media 存储桶和上传策略。'
    } else {
      errorMessage.value = message
    }
  } finally {
    saving.value = false
  }
}
</script>
