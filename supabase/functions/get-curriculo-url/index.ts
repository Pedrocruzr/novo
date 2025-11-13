import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const bodySchema = z.object({ candidatoId: z.string().uuid() })

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['recrutador','admin'].includes(profile.role)) return new Response('Forbidden', { status: 403 })

  let payload: unknown
  try { payload = await req.json() } catch { return new Response('Bad JSON', { status: 400 }) }
  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) return new Response('Invalid payload', { status: 422 })

  const admin = createClient(supabaseUrl, serviceRole)
  const { data: cand, error } = await admin.from('candidatos').select('curriculo_path').eq('id', parsed.data.candidatoId).single()
  if (error || !cand?.curriculo_path) return new Response('Not found', { status: 404 })

  const { data: signed, error: sErr } = await admin.storage.from('curriculos').createSignedUrl(cand.curriculo_path, 600)
  if (sErr || !signed?.signedUrl) return new Response('Cannot sign', { status: 500 })

  return new Response(JSON.stringify({ url: signed.signedUrl }), { headers: { 'Content-Type': 'application/json' } })
})
