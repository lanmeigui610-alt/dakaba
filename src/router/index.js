import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Calendar from '../views/Calendar.vue'
import Feed from '../views/Feed.vue'
import Publish from '../views/Publish.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import AdminStats from '../views/AdminStats.vue'
import Auth from '../views/Auth.vue'
import Tasks from '../views/Tasks.vue'
import { supabase } from '../lib/supabase'

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/auth', name: 'auth', component: Auth },
  { path: '/calendar', name: 'calendar', component: Calendar, meta: { requiresAuth: true } },
  { path: '/tasks', name: 'tasks', component: Tasks, meta: { requiresAuth: true } },
  { path: '/feed', name: 'feed', component: Feed, meta: { requiresAuth: true } },
  { path: '/publish', name: 'publish', component: Publish, meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/admin', name: 'admin', component: AdminStats },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getUser()
  if (to.meta.requiresAuth && !data.user) {
    return { path: '/auth', query: { redirect: to.fullPath } }
  }
  if (to.path === '/auth' && data.user) {
    return '/'
  }
  return true
})

export default router
