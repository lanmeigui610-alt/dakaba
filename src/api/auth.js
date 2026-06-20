import { supabase, requireUser } from '../lib/supabase'

export async function signUpWithPhone({ phone, password, nickname, securityQuestion, securityAnswer }) {
  const credentials = phone.includes('@')
    ? { email: phone, password, options: { data: { nickname } } }
    : { phone, password, options: { data: { nickname } } }
  const { data, error } = await supabase.auth.signUp(credentials)
  if (error) throw error
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      nickname,
    })
    await supabase.from('account_recovery').upsert({
      user_id: data.user.id,
      security_question: securityQuestion,
      security_answer_hash: securityAnswer.trim().toLowerCase(),
    })
  }
  return data
}

export async function signInWithPhone({ phone, password }) {
  const credentials = phone.includes('@') ? { email: phone, password } : { phone, password }
  const { data, error } = await supabase.auth.signInWithPassword(credentials)
  if (error) throw error
  return data
}

export async function updatePassword(password) {
  const { data, error } = await supabase.auth.updateUser({ password })
  if (error) throw error
  return data
}

export async function updateProfile(profile) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return data
}
