import { z } from 'zod'

export const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

export const fileSchema = z.object({
  filename: z.string().min(3).max(160),
  mime: z.enum(ALLOWED_MIME),
  size: z.number().int().positive().max(5 * 1024 * 1024),
  candidatoId: z.string().uuid()
})

export const vagaSchema = z.object({
  titulo: z.string().min(4).max(120),
  descricao_publica: z.string().min(20).max(4000),
  local: z.string().min(2).max(120),
  senioridade: z.enum(['estagio','junior','pleno','senior','especialista']),
  status: z.enum(['rascunho','publicada']).default('rascunho')
})
