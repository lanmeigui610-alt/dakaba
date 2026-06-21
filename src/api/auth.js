import { supabase, requireUser } from '../lib/supabase'

export async function signUpWithPhone({ phone, password, nickname, securityQuestion, securityAnswer }) {
  const credentials = phone.includes('@')
    ? { email: phone, password, options: { data: { nickname } } }
    : { phone, password, options: { data: { nickname } } }
  const { data, error } = await supabase.auth.signUp(credentials)
  if (error) throw error
  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      nickname,
    })
    if (profileError) console.warn('profile upsert skipped:', profileError.message)

    const { error: recoveryError } = await supabase.from('account_recovery').upsert({
      user_id: data.user.id,
      security_question: securityQuestion,
      security_answer_hash: securityAnswer.trim().toLowerCase(),
    })
    if (recoveryError) console.warn('account recovery upsert skipped:', recoveryError.message)
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

export async function sendPasswordReset(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth`,
  })
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

export async function ensureProfile() {
  const user = await requireUser()
  const nickname = user.user_metadata?.nickname || user.email?.split('@')[0] || user.phone || '哒咔用户'
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, nickname }, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}
