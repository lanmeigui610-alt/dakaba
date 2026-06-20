import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'light',
    displayMode: 'auto',
  }),
  actions: {
    restore() {
      this.theme = localStorage.getItem('dakaba-theme') || 'light'
      this.displayMode = localStorage.getItem('dakaba-display-mode') || 'auto'
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('dakaba-theme', this.theme)
    },
    setDisplayMode(mode) {
      this.displayMode = mode
      localStorage.setItem('dakaba-display-mode', mode)
    },
  },
})
