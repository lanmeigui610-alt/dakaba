import { supabase, requireUser } from '../lib/supabase'

export async function upsertDiary({ entryDate, body, mood, emoji }) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('diaries')
    .upsert({
      user_id: user.id,
      entry_date: entryDate,
      body,
      mood,
      emoji,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,entry_date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listDiaryMarks(month) {
  const user = await requireUser()
  const start = `${month}-01`
  const endDate = new Date(`${month}-01T00:00:00`)
  endDate.setMonth(endDate.getMonth() + 1)
  const end = endDate.toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('diaries')
    .select('entry_date, emoji')
    .eq('user_id', user.id)
    .gte('entry_date', start)
    .lt('entry_date', end)
  if (error) throw error
  return data
}

export async function getReview(range = 'month') {
  const { data, error } = await supabase.rpc('get_private_review', { range_name: range })
  if (error) throw error
  return data
}
