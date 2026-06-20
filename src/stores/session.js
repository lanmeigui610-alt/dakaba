import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: null,
    profile: null,
  }),
  actions: {
    async load() {
      const { data } = await supabase.auth.getUser()
      this.user = data.user
      if (this.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .single()
        this.profile = profile
      }
    },
    async signOut() {
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
    },
  },
})
