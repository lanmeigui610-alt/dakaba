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

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/auth', name: 'auth', component: Auth },
  { path: '/calendar', name: 'calendar', component: Calendar },
  { path: '/tasks', name: 'tasks', component: Tasks },
  { path: '/feed', name: 'feed', component: Feed },
  { path: '/publish', name: 'publish', component: Publish },
  { path: '/profile', name: 'profile', component: Profile },
  { path: '/settings', name: 'settings', component: Settings },
  { path: '/admin', name: 'admin', component: AdminStats },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
