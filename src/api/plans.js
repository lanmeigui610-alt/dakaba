import { supabase, requireUser } from '../lib/supabase'

export async function listPlans(date) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('plan_date', date)
    .order('created_at')
  if (error) throw error
  return data
}

export async function createPlan(title, date) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('plans')
    .insert({ user_id: user.id, title, plan_date: date })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function togglePlan(plan) {
  const { data, error } = await supabase
    .from('plans')
    .update({ completed: !plan.completed, completed_at: !plan.completed ? new Date().toISOString() : null })
    .eq('id', plan.id)
    .select()
    .single()
  if (error) throw error
  return data
}
