import { supabase, requireUser } from '../lib/supabase'

export async function listCountdowns() {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('countdowns')
    .select('*')
    .eq('user_id', user.id)
    .order('target_date')
  if (error) throw error
  return data
}

export async function createCountdown(payload) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('countdowns')
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listBirthdays() {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('birthdays')
    .select('*')
    .eq('user_id', user.id)
    .order('birthday')
  if (error) throw error
  return data
}
