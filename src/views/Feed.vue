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
          <span v-if="moment.mood" class="rounded-xl bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700 ring-1 ring-blue-100">{{ moment.mood }}</span>
        </div>

        <div class="mt-4 flex items-center gap-2 border-t border-black/10 pt-3 dark:border-white/10">
          <button class="tap flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="like(moment.id)">
            <Heart class="h-4 w-4" />{{ moment.moment_likes?.length || 0 }}
          </button>
          <button class="tap flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="toggleComments(moment.id)">
            <MessageCircle class="h-4 w-4" />{{ moment.comments?.length || 0 }}
          </button>
          <button class="tap ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="exportCard(moment.id)">
            <Download class="h-4 w-4" />导出
          </button>
        </div>

        <section v-if="openComments[moment.id]" class="comment-box">
          <div class="emoji-row">
            <button v-for="emoji in emojis" :key="emoji" type="button" :class="{ active: commentForms[moment.id]?.emoji === emoji }" @click="setEmoji(moment.id, emoji)">
              {{ emoji }}
            </button>
          </div>
          <div class="comment-input">
            <input v-model="ensureForm(moment.id).body" :placeholder="replyTarget[moment.id] ? `回复 ${replyTarget[moment.id].name}` : '写一句评论'" @keydown.enter="submitComment(moment)" />
            <button type="button" @click="submitComment(moment)">发布</button>
          </div>
          <button v-if="replyTarget[moment.id]" class="cancel-reply" type="button" @click="replyTarget[moment.id] = null">
            取消回复
          </button>

          <div v-if="rootComments(moment).length" class="comment-list">
            <article v-for="comment in rootComments(moment)" :key="comment.id" class="comment-item">
              <div class="comment-main">
                <span class="comment-emoji">{{ comment.emoji || '💬' }}</span>
                <div class="min-w-0 flex-1">
                  <p><b>{{ comment.profiles?.nickname || '哒咔用户' }}</b> {{ comment.body }}</p>
                  <small>{{ formatTime(comment.created_at) }}</small>
                </div>
              </div>
              <div class="comment-actions">
                <button type="button" @click="likeThisComment(comment.id)">
                  <Heart class="h-3.5 w-3.5" />{{ comment.comment_likes?.length || 0 }}
                </button>
                <button type="button" @click="startReply(moment.id, comment)">回复</button>
              </div>
              <div v-if="childComments(moment, comment.id).length" class="reply-list">
                <article v-for="reply in childComments(moment, comment.id)" :key="reply.id" class="reply-item">
                  <span>{{ reply.emoji || '↳' }}</span>
                  <p><b>{{ reply.profiles?.nickname || '哒咔用户' }}</b> {{ reply.body }}</p>
                  <button type="button" @click="likeThisComment(reply.id)">
                    <Heart class="h-3.5 w-3.5" />{{ reply.comment_likes?.length || 0 }}
                  </button>
                </article>
              </div>
            </article>
          </div>
          <p v-else class="empty-comment">还没有评论，先留下一句吧。</p>
        </section>
      </article>
    </section>
  </main>
  <PixelPet />
  <BottomNav />
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Download, Heart, MessageCircle } from '@lucide/vue'
import BottomNav from '../components/BottomNav.vue'
import PixelPet from '../components/PixelPet.vue'
import { createMomentComment, exportMomentCard, likeComment, likeMoment, listMoments } from '../api/feed'

const fallbackAvatar = 'https://api.dicebear.com/9.x/pixel-art/svg?seed=dakaba'
const month = ref(new Date().toISOString().slice(0, 7))
const tag = ref('')
const activeTab = ref('all')
const moments = ref([])
const cardRefs = new Map()
const openComments = reactive({})
const commentForms = reactive({})
const replyTarget = reactive({})
const emojis = ['😊', '🥳', '💙', '🌹', '🔥', '😌', '😭', '✨']
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

function ensureForm(momentId) {
  if (!commentForms[momentId]) commentForms[momentId] = { emoji: '😊', body: '' }
  return commentForms[momentId]
}

function setEmoji(momentId, emoji) {
  ensureForm(momentId).emoji = emoji
}

function toggleComments(momentId) {
  openComments[momentId] = !openComments[momentId]
  ensureForm(momentId)
}

function rootComments(moment) {
  return (moment.comments || []).filter((item) => !item.parent_id).sort(sortByTime)
}

function childComments(moment, parentId) {
  return (moment.comments || []).filter((item) => item.parent_id === parentId).sort(sortByTime)
}

function sortByTime(a, b) {
  return new Date(a.created_at) - new Date(b.created_at)
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

async function likeThisComment(id) {
  await likeComment(id)
  await load()
}

function startReply(momentId, comment) {
  replyTarget[momentId] = {
    id: comment.id,
    name: comment.profiles?.nickname || '哒咔用户',
  }
  ensureForm(momentId)
}

async function submitComment(moment) {
  const form = ensureForm(moment.id)
  const body = form.body.trim()
  if (!body) return
  await createMomentComment({
    momentId: moment.id,
    body,
    emoji: form.emoji,
    parentId: replyTarget[moment.id]?.id || null,
  })
  form.body = ''
  replyTarget[moment.id] = null
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

<style scoped>
.comment-box {
  margin-top: 12px;
  border-radius: 18px;
  background: #f3f8ff;
  padding: 12px;
}
.emoji-row {
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 8px;
}
.emoji-row button {
  display: grid;
  width: 34px;
  height: 34px;
  flex: none;
  place-items: center;
  border-radius: 999px;
  background: white;
  font-size: 18px;
}
.emoji-row button.active {
  box-shadow: 0 0 0 2px #2563eb;
}
.comment-input {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}
.comment-input input {
  min-width: 0;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: white;
  padding: 11px 12px;
  outline: none;
}
.comment-input button {
  border-radius: 16px;
  background: #2563eb;
  padding: 0 14px;
  color: white;
  font-weight: 900;
}
.cancel-reply {
  margin-top: 8px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}
.comment-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}
.comment-item {
  border-radius: 16px;
  background: white;
  padding: 10px;
}
.comment-main {
  display: flex;
  gap: 8px;
}
.comment-emoji {
  font-size: 20px;
}
.comment-main p {
  color: #172033;
  font-size: 14px;
  line-height: 1.6;
}
.comment-main small {
  color: #7b8aa0;
  font-size: 11px;
}
.comment-actions {
  margin-top: 6px;
  display: flex;
  gap: 12px;
  padding-left: 30px;
}
.comment-actions button,
.reply-item button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}
.reply-list {
  margin-top: 8px;
  display: grid;
  gap: 6px;
  padding-left: 30px;
}
.reply-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px;
  border-radius: 12px;
  background: #eff6ff;
  padding: 8px;
  font-size: 13px;
}
.empty-comment {
  margin-top: 10px;
  color: #2563eb;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
}
</style>
