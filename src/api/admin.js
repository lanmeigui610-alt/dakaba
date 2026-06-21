import { supabase } from '../lib/supabase'

export async function getAdminStats() {
  const { data, error } = await supabase.rpc('get_admin_stats')
  if (error) throw error
  return data
}

export async function getAdminUsers() {
  const { data, error } = await supabase.rpc('get_admin_users')
  if (error) throw error
  return data || []
}
