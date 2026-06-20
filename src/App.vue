<template>
  <div :class="{ dark: settings.theme === 'dark' }">
    <div class="min-h-screen bg-paper text-zinc-950 dark:bg-ink dark:text-zinc-50">
      <RouterView />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettingsStore } from './stores/settings'

const settings = useSettingsStore()

onMounted(() => settings.restore())
</script>
