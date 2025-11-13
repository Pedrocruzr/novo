'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Vaga = { id: string; titulo: string; local: string; senioridade: string; publicada_em: string | null; descricao_publica: string }

export default function HomePage() {
  const [vagas, setVagas] = useState<Vaga[]>([])

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('vagas_publicas')
        .select('*')
        .order('publicada_em', { ascending: false })
      setVagas((data || []) as Vaga[])
    })()
  }, [])

  return (
    <div>
      <h1>Vagas Públicas</h1>
      {vagas.length === 0 && <p>Nenhuma vaga publicada.</p>}
      {vagas.map(v => (
        <div key={v.id} className="card">
          <h3>{v.titulo} — {v.senioridade}</h3>
          <p><b>Local:</b> {v.local}</p>
          <p>{v.descricao_publica}</p>
        </div>
      ))}
    </div>
  )
}
