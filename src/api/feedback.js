import { supabase, requireUser } from '../lib/supabase'

export async function listPublicFeedback() {
  const { data, error } = await supabase
    .from('developer_feedback')
    .select('id, body, reply, created_at, replied_at, profiles!developer_feedback_user_id_fkey(nickname, avatar_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(8)
  if (error) throw error
  return data || []
}

export async function createFeedback(body) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('developer_feedback')
    .insert({
      user_id: user.id,
      body,
      is_public: true,
    })
    .select('id, body, reply, created_at, replied_at')
    .single()
  if (error) throw error
  return data
}

export async function listAdminFeedback(pin) {
  const { data, error } = await supabase.rpc('get_admin_feedback', { admin_pin: pin || '2641' })
  if (error) throw error
  return data || []
}

export async function replyFeedback({ feedbackId, reply, pin }) {
  const { data, error } = await supabase.rpc('reply_developer_feedback', {
    feedback_id: feedbackId,
    reply_body: reply,
    admin_pin: pin || '2641',
  })
  if (error) throw error
  return data
}
