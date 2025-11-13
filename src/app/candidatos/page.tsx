'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

type Cand = { id: string; nome?: string | null; email?: string | null; curriculo_path?: string | null }

export default function CandidatosPage() {
  const [cands, setCands] = useState<Cand[]>([])
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('candidatos').select('id, nome, email, curriculo_path').limit(50)
      if (error) setErr(error.message)
      else setCands(data as Cand[])
    })()
  }, [])

  return (
    <div>
      <h1>Candidatos</h1>
      {err && <p style={{color:'crimson'}}>Erro: {err}</p>}
      {cands.map(c => (
        <div key={c.id} className="card">
          <b>{c.nome || 'Sem nome'}</b><br/>
          <small>{c.email || '-'}</small><br/>
          <small>Arquivo: {c.curriculo_path ? 'presente' : '—'}</small>
        </div>
      ))}
    </div>
  )
}
