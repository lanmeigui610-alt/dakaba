import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isDemoMode = !supabaseUrl || !supabaseAnonKey

const today = new Date().toISOString().slice(0, 10)
const demoStore = {
  profiles: [{ id: 'demo-user', nickname: '哒咔用户', avatar_url: '', bio: '每天留下一点痕迹。', is_banned: false }],
  moments: [
    {
      id: 'demo-moment-1',
      user_id: 'demo-user',
      body: '今天完成了晨读和整理，给自己一个小小的赞。',
      media_urls: [],
      visibility: 'public',
      mood: '😊 开心',
      tags: ['日常', '打卡'],
      published_at: new Date().toISOString(),
      profiles: { nickname: '哒咔用户', avatar_url: '' },
      moment_likes: [{ user_id: 'demo-user' }],
      comments: [],
    },
  ],
  plans: [
    { id: 'plan-1', user_id: 'demo-user', title: '晨读 20 分钟', plan_date: today, completed: true, category: 'habit' },
    { id: 'plan-2', user_id: 'demo-user', title: '喝水 8 杯', plan_date: today, completed: false, category: 'habit' },
    { id: 'plan-3', user_id: 'demo-user', title: '整理今日复盘', plan_date: today, completed: false, category: 'todo' },
  ],
  countdowns: [
    { id: 'countdown-1', user_id: 'demo-user', title: '考试', target_date: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10), color: '#3b82f6' },
  ],
  birthdays: [],
  diaries: [{ id: 'diary-1', user_id: 'demo-user', entry_date: today, emoji: '🌿', body: '状态不错，继续保持。' }],
}

function demoResponse(data = null) {
  return Promise.resolve({ data, error: null })
}

function createDemoQuery(table) {
  let rows = [...(demoStore[table] || [])]
  const query = {
    select: () => query,
    insert: (value) => {
      const row = { id: crypto.randomUUID(), ...(Array.isArray(value) ? value[0] : value) }
      demoStore[table] = [row, ...(demoStore[table] || [])]
      rows = [row]
      return query
    },
    update: (value) => {
      rows = rows.map((row) => ({ ...row, ...value }))
      return query
    },
    upsert: (value) => {
      const row = { id: value.id || crypto.randomUUID(), ...(Array.isArray(value) ? value[0] : value) }
      demoStore[table] = [row, ...(demoStore[table] || []).filter((item) => item.id !== row.id)]
      rows = [row]
      return query
    },
    eq: (column, value) => {
      rows = rows.filter((row) => row[column] === value)
      return query
    },
    gte: () => query,
    lt: () => query,
    or: () => query,
    contains: () => query,
    order: () => query,
    single: () => demoResponse(rows[0] || null),
    then: (resolve) => resolve({ data: rows, error: null }),
  }
  return query
}

const demoSupabase = {
  auth: {
    getUser: () => demoResponse({ user: { id: 'demo-user', email: 'demo@dakaba.local' } }),
    signUp: () => demoResponse({ user: { id: 'demo-user' } }),
    signInWithPassword: () => demoResponse({ user: { id: 'demo-user' } }),
    updateUser: () => demoResponse({ user: { id: 'demo-user' } }),
    resetPasswordForEmail: () => demoResponse({}),
    signOut: () => demoResponse(null),
  },
  from: (table) => createDemoQuery(table),
  rpc: (name, args = {}) => {
    if (name === 'get_admin_users') {
      return demoResponse([{ user_id: 'demo-user', account: 'demo@dakaba.local', nickname: '哒咔用户', created_at: new Date().toISOString(), last_sign_in_at: new Date().toISOString(), is_banned: false, moment_count: 1, checkin_count: 1 }])
    }
    if (name === 'set_user_ban') {
      demoStore.profiles[0].is_banned = Boolean(args.banned)
      return demoResponse(true)
    }
    return demoResponse({ total_users: 1, today_active_users: 1, total_checkins: 1, storage_mb: 0 })
  },
  storage: {
    from: () => ({
      upload: () => demoResponse(null),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}

export const supabase = isDemoMode ? demoSupabase : createClient(supabaseUrl, supabaseAnonKey)

export async function requireUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw error || new Error('请先登录')
  return data.user
}
