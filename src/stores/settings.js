import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    theme: 'dark',
  }),
  actions: {
    restore() {
      this.theme = localStorage.getItem('dakaba-theme') || 'dark'
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('dakaba-theme', this.theme)
    },
  },
})
