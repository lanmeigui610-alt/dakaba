import { supabase } from '../lib/supabase'

export async function getAdminStats(pin) {
  const { data, error } = await supabase.rpc('get_admin_stats', { admin_pin: pin || '2641' })
  if (error) throw error
  return data
}

export async function getAdminUsers(pin) {
  const { data, error } = await supabase.rpc('get_admin_users', { admin_pin: pin || '2641' })
  if (error) throw error
  return data || []
}

export async function setUserBan(userId, banned, pin) {
  const { data, error } = await supabase.rpc('set_user_ban', {
    target_user_id: userId,
    banned,
    admin_pin: pin || '2641',
  })
  if (error) throw error
  return data
}
