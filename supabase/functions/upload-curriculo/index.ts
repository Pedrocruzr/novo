import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const ALLOWED = new Set(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
const metaSchema = z.object({ candidatoId: z.string().uuid() })

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || !['recrutador','admin'].includes(profile.role)) return new Response('Forbidden', { status: 403 })

    const form = await req.formData()
    const file = form.get('file')
    const candidatoId = String(form.get('candidatoId') || '')

    const parsed = metaSchema.safeParse({ candidatoId })
    if (!parsed.success) return new Response('Invalid candidatoId', { status: 422 })
    if (!(file instanceof File)) return new Response('File required', { status: 400 })
    if (!ALLOWED.has(file.type)) return new Response('Invalid mime', { status: 415 })
    if (file.size > 5 * 1024 * 1024) return new Response('File too large (max 5MB)', { status: 413 })

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/${parsed.data.candidatoId}/${Date.now()}_${safeName}`

    const admin = createClient(supabaseUrl, serviceRole)
    const { error: upErr } = await admin.storage.from('curriculos').upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: false
    })
    if (upErr) return new Response(`Upload error: ${upErr.message}`, { status: 500 })

    const { error: upC } = await admin.from('candidatos').update({ curriculo_path: path }).eq('id', parsed.data.candidatoId)
    if (upC) return new Response(`DB error: ${upC.message}`, { status: 500 })

    return new Response(JSON.stringify({ ok: true, path }), { headers: { 'Content-Type': 'application/json' } })
  } catch (_e) {
    return new Response('Internal Error', { status: 500 })
  }
})
