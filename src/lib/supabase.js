import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isDemoMode = !supabaseUrl || !supabaseAnonKey

const today = new Date().toISOString().slice(0, 10)

function demoResponse(data = null) {
  return Promise.resolve({ data, error: null })
}

const demoRows = {
  profiles: [
    {
      id: 'demo-user',
      nickname: '哒咔用户',
      avatar_url: '',
      bio: '慢慢来，也要一直往前。',
    },
  ],
  moments: [
    {
      id: 'demo-moment-1',
      user_id: 'demo-user',
      body: '今天完成了晨读、背单词和 30 分钟整理。小小的一天，也算认真过了。',
      media_urls: [],
      visibility: 'public',
      mood: '踏实',
      tags: ['学习', '日常'],
      published_at: new Date().toISOString(),
      profiles: { nickname: '哒咔用户', avatar_url: '' },
      moment_likes: [{ user_id: 'demo-user' }, { user_id: 'friend' }],
      comments: [{ id: 'comment-1' }],
    },
    {
      id: 'demo-moment-2',
      user_id: 'demo-user',
      body: '这条是私密动态。配置 Supabase 后，RLS 会保证只有作者本人能看到。',
      media_urls: [],
      visibility: 'private',
      mood: '安静',
      tags: ['私密'],
      published_at: new Date(Date.now() - 86400000).toISOString(),
      profiles: { nickname: '哒咔用户', avatar_url: '' },
      moment_likes: [],
      comments: [],
    },
  ],
  plans: [
    { id: 'plan-1', user_id: 'demo-user', title: '完成英语听力 20 分钟', plan_date: today, completed: true },
    { id: 'plan-2', user_id: 'demo-user', title: '整理明天任务清单', plan_date: today, completed: false },
    { id: 'plan-3', user_id: 'demo-user', title: '发布一条朋友圈记录', plan_date: today, completed: false },
  ],
  countdowns: [
    { id: 'countdown-1', user_id: 'demo-user', title: '考试', target_date: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10), color: '#52d273' },
    { id: 'countdown-2', user_id: 'demo-user', title: '项目上线', target_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), color: '#38bdf8' },
  ],
  birthdays: [
    { id: 'birthday-1', user_id: 'demo-user', name: '朋友生日', birthday: `${new Date().getFullYear()}-12-24` },
  ],
  diaries: [
    { id: 'diary-1', user_id: 'demo-user', entry_date: today, emoji: '🌿', body: '状态不错，继续保持。' },
  ],
}

function createDemoQuery(table, seedRows = demoRows[table] || []) {
  let rows = [...seedRows]
  const query = {
    select: () => query,
    insert: (value) => {
      const row = Array.isArray(value) ? value[0] : value
      return createDemoQuery(table, [{ id: crypto.randomUUID(), ...row }])
    },
    update: (value) => createDemoQuery(table, rows.map((row) => ({ ...row, ...value }))),
    upsert: (value) => {
      const row = Array.isArray(value) ? value[0] : value
      return createDemoQuery(table, [{ id: row.id || crypto.randomUUID(), ...row }])
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
    getUser: () => demoResponse({ user: { id: 'demo-user', phone: 'demo' } }),
    signUp: () => demoResponse({ user: { id: 'demo-user' } }),
    signInWithPassword: () => demoResponse({ user: { id: 'demo-user' } }),
    updateUser: () => demoResponse({ user: { id: 'demo-user' } }),
    signOut: () => demoResponse(null),
  },
  from: (table) => createDemoQuery(table),
  rpc: (name) => demoResponse(name === 'get_admin_stats'
    ? { total_users: 1, today_active_users: 1, total_checkins: 26, storage_mb: 0 }
    : { range: 'month', plans_done: 26, diary_days: 12 }),
  storage: {
    from: () => ({
      upload: () => demoResponse(null),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
}

export const supabase = isDemoMode
  ? demoSupabase
  : createClient(supabaseUrl, supabaseAnonKey)

export async function requireUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) throw error || new Error('请先登录')
  return data.user
}
