import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3'
import { Ratelimit } from 'https://esm.sh/@upstash/ratelimit@1'
import { Redis } from 'https://esm.sh/@upstash/redis@1'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
const redisUrl = Deno.env.get('UPSTASH_REDIS_REST_URL')
const redisToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')
const limiter = (redisUrl && redisToken) ? new Ratelimit({ redis: new Redis({ url: redisUrl, token: redisToken }), limiter: Ratelimit.fixedWindow(20, '60 s') }) : null

const bodySchema = z.object({
  candidatoId: z.string().uuid(),
  filename: z.string().min(3),
  mime: z.enum(['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  size: z.number().int().positive().max(5 * 1024 * 1024)
})

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization') ?? ''
  const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['recrutador','admin'].includes(profile.role)) return new Response('Forbidden', { status: 403 })

  if (limiter) {
    const { success } = await limiter.limit(`proc:${user.id}`)
    if (!success) return new Response('Too Many Requests', { status: 429 })
  }

  let payload: unknown
  try { payload = await req.json() } catch { return new Response('Bad JSON', { status: 400 }) }
  const parsed = bodySchema.safeParse(payload)
  if (!parsed.success) return new Response('Invalid payload', { status: 422 })

  // Lógica de IA stub (não logar PII)
  const resultado = { score: 0.82, tags: ['typescript','cloud','junior'] }

  await supabase.rpc('log_evento', { categoria: 'ia', acao: 'processar_curriculo', alvo: parsed.data.candidatoId, detalhes: {} })
  return new Response(JSON.stringify({ ok: true, resultado }), { headers: { 'Content-Type': 'application/json' } })
})
