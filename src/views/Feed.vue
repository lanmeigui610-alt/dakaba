<template>
  <main class="safe-bottom mx-auto max-w-md px-4 py-5">
    <header class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black">个人朋友圈</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400">公开可互动，私密只给自己看</p>
      </div>
      <RouterLink to="/publish" class="tap rounded-lg bg-brand px-4 py-2 text-sm font-bold text-zinc-950">发布</RouterLink>
    </header>

    <section class="card mb-4">
      <div class="mb-3 grid grid-cols-3 gap-2">
        <button v-for="tab in tabs" :key="tab.key" class="tap rounded-lg px-3 py-2 text-sm font-bold" :class="activeTab === tab.key ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-zinc-100 dark:bg-zinc-800'" @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </div>
      <div class="grid grid-cols-[1fr_auto] gap-2">
        <input v-model="month" type="month" class="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/10" />
        <input v-model="tag" class="w-24 rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none dark:border-white/10" placeholder="标签" />
      </div>
    </section>

    <section class="space-y-4">
      <article v-for="moment in visibleMoments" :key="moment.id" :ref="setCardRef(moment.id)" class="card">
        <div class="mb-3 flex gap-3">
          <img :src="moment.profiles?.avatar_url || fallbackAvatar" class="h-12 w-12 rounded-lg object-cover pixelated" alt="" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <h2 class="truncate font-bold">{{ moment.profiles?.nickname || '哒咔用户' }}</h2>
              <span class="rounded px-2 py-1 text-xs font-semibold" :class="moment.visibility === 'public' ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'">
                {{ moment.visibility === 'public' ? '公开' : '私密' }}
              </span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">{{ formatTime(moment.published_at) }}</p>
          </div>
        </div>

        <p class="whitespace-pre-wrap leading-7">{{ moment.body }}</p>
        <div v-if="moment.media_urls?.length" class="mt-3 grid grid-cols-3 gap-2">
          <img v-for="url in moment.media_urls" :key="url" :src="url" class="aspect-square rounded-lg object-cover" alt="" />
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <span v-for="item in moment.tags" :key="item" class="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">#{{ item }}</span>
          <span v-if="moment.mood" class="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-200">{{ moment.mood }}</span>
        </div>

        <div class="mt-4 flex items-center gap-2 border-t border-black/10 pt-3 dark:border-white/10">
          <button class="tap flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="like(moment.id)">
            <Heart class="h-4 w-4" />{{ moment.moment_likes?.length || 0 }}
          </button>
          <button class="tap flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <MessageCircle class="h-4 w-4" />{{ moment.comments?.length || 0 }}
          </button>
          <button class="tap ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="exportCard(moment.id)">
            <Download class="h-4 w-4" />导出
          </button>
        </div>
      </article>
    </section>
  </main>
  <PixelPet />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Download, Heart, MessageCircle } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { exportMomentCard, likeMoment, listMoments } from '../api/feed'

const fallbackAvatar = 'https://api.dicebear.com/9.x/pixel-art/svg?seed=dakaba'
const month = ref(new Date().toISOString().slice(0, 7))
const tag = ref('')
const activeTab = ref('all')
const moments = ref([])
const cardRefs = new Map()
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'public', label: '公开' },
  { key: 'private', label: '私密' },
]

const visibleMoments = computed(() => {
  if (activeTab.value === 'all') return moments.value
  return moments.value.filter((item) => item.visibility === activeTab.value)
})

onMounted(load)
watch([month, tag], load)

async function load() {
  moments.value = await listMoments({ month: month.value, tag: tag.value || undefined }).catch(() => [])
}

function setCardRef(id) {
  return (el) => {
    if (el) cardRefs.set(id, el)
  }
}

async function like(id) {
  await likeMoment(id)
  await load()
}

function exportCard(id) {
  exportMomentCard(cardRefs.get(id), `dakaba-${id}.png`)
}

function formatTime(value) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}
</script>
