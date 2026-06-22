<template>
  <div :class="[{ dark: settings.theme === 'dark' }, `mode-${settings.displayMode}`]">
    <div class="app-shell min-h-screen text-zinc-950 dark:text-zinc-50">
      <div class="ambient ambient-a"></div>
      <div class="ambient ambient-b"></div>
      <RouterView />
      <WelcomePetModal v-model="showWelcome" @close="closeWelcome" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import WelcomePetModal from './components/WelcomePetModal.vue'
import { supabase } from './lib/supabase'

const settings = useSettingsStore()
const route = useRoute()
const showWelcome = ref(false)
const welcomeKey = ref('')

onMounted(() => {
  settings.restore()
  checkWelcome()
})

watch(
  () => route.fullPath,
  () => checkWelcome(),
)

async function checkWelcome() {
  if (route.path === '/auth' || route.path === '/admin') return
  if (route.query.welcome === '1') {
    showWelcome.value = true
    return
  }

  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return

  const key = `dakaba-welcome-seen-${user.id}`
  welcomeKey.value = key
  if (!localStorage.getItem(key)) {
    showWelcome.value = true
  }
}

function closeWelcome() {
  if (welcomeKey.value) localStorage.setItem(welcomeKey.value, '1')
  showWelcome.value = false
}
</script>
