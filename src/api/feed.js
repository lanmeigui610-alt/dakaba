import imageCompression from 'browser-image-compression'
import { supabase, requireUser } from '../lib/supabase'

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://dakaba.vercel.app'

export async function compressImages(files) {
  const options = {
    maxSizeMB: 0.48,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.82,
  }
  return Promise.all(Array.from(files).map((file) => imageCompression(file, options)))
}

export async function uploadMomentImages(files) {
  const user = await requireUser()
  const compressed = await compressImages(files)
  const urls = []
  for (const file of compressed) {
    const path = `${user.id}/${Date.now()}-${crypto.randomUUID()}.webp`
    const { error } = await supabase.storage.from('moment-media').upload(path, file, {
      contentType: 'image/webp',
      upsert: false,
    })
    if (error) throw error
    const { data } = supabase.storage.from('moment-media').getPublicUrl(path)
    urls.push(data.publicUrl)
  }
  return urls
}

export async function createMoment({ body, mediaFiles, visibility, mood, tags }) {
  const user = await requireUser()
  const media_urls = mediaFiles?.length ? await uploadMomentImages(mediaFiles) : []
  const { data, error } = await supabase
    .from('moments')
    .insert({
      user_id: user.id,
      body,
      media_urls,
      visibility,
      mood,
      tags,
      published_at: new Date().toISOString(),
    })
    .select('*, profiles(nickname, avatar_url)')
    .single()
  if (error) throw error
  return data
}

export async function listMoments({ month, tag, includePrivate = true } = {}) {
  const user = await requireUser()
  let query = supabase
    .from('moments')
    .select('*, profiles(nickname, avatar_url), moment_likes(user_id), comments(id)')
    .or(includePrivate ? `visibility.eq.public,user_id.eq.${user.id}` : 'visibility.eq.public')
    .order('published_at', { ascending: false })

  if (month) {
    const start = new Date(`${month}-01T00:00:00`)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 1)
    query = query.gte('published_at', start.toISOString()).lt('published_at', end.toISOString())
  }
  if (tag) query = query.contains('tags', [tag])

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function likeMoment(momentId) {
  const user = await requireUser()
  const { error } = await supabase.from('moment_likes').upsert({
    moment_id: momentId,
    user_id: user.id,
  })
  if (error) throw error
}

export async function createComment(momentId, body) {
  const user = await requireUser()
  const { data, error } = await supabase
    .from('comments')
    .insert({ moment_id: momentId, user_id: user.id, body })
    .select('*, profiles(nickname, avatar_url)')
    .single()
  if (error) throw error
  return data
}

export async function exportMomentCard(element, fileName = 'dakaba-moment.png') {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: null })
  const ctx = canvas.getContext('2d')
  ctx.save()
  ctx.font = '22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,.9)'
  ctx.strokeStyle = 'rgba(0,0,0,.45)'
  ctx.lineWidth = 4
  const text = `哒咔Ba · ${SITE_URL}`
  const x = canvas.width - ctx.measureText(text).width - 28
  const y = canvas.height - 28
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
  ctx.restore()
  const link = document.createElement('a')
  link.download = fileName
  link.href = canvas.toDataURL('image/png')
  link.click()
}
