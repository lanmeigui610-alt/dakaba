<template>
  <div :class="[{ dark: settings.theme === 'dark' }, `mode-${settings.displayMode}`]">
    <div class="app-shell min-h-screen text-zinc-950 dark:text-zinc-50">
      <div class="ambient ambient-a"></div>
      <div class="ambient ambient-b"></div>
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
