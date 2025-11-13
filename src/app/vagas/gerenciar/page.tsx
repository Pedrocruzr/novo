'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { vagaSchema } from '../../../lib/schemas'

type Vaga = { id: string; titulo: string; status: 'rascunho'|'publicada'; local: string; senioridade: string; descricao_publica: string }

export default function GerenciarVagasPage() {
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [form, setForm] = useState({ titulo:'', descricao_publica:'', local:'', senioridade:'junior', status:'rascunho' as 'rascunho'|'publicada' })

  async function load() {
    const { data } = await supabase.from('vagas').select('id,titulo,status,local,senioridade,descricao_publica').order('id', { ascending: false }).limit(50)
    setVagas((data || []) as any)
  }
  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    const parsed = vagaSchema.safeParse(form)
    if (!parsed.success) { setMsg('Formulário inválido'); return; }
    const { error } = await supabase.from('vagas').insert(parsed.data)
    setMsg(error ? error.message : 'Vaga criada!')
    await load()
  }

  return (
    <div>
      <h1>Gerenciar Vagas</h1>
      <form onSubmit={save} className="card">
        <label>Título</label><input value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} />
        <label>Descrição pública</label><textarea value={form.descricao_publica} onChange={e=>setForm({...form, descricao_publica:e.target.value})} />
        <label>Local</label><input value={form.local} onChange={e=>setForm({...form, local:e.target.value})} />
        <label>Senioridade</label>
        <select value={form.senioridade} onChange={e=>setForm({...form, senioridade:e.target.value as any})}>
          <option>estagio</option><option>junior</option><option>pleno</option><option>senior</option><option>especialista</option>
        </select>
        <label>Status</label>
        <select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})}>
          <option>rascunho</option><option>publicada</option>
        </select>
        <div style={{marginTop:12}}><button type="submit">Salvar</button></div>
        {msg && <p>{msg}</p>}
      </form>

      {vagas.map(v => (
        <div key={v.id} className="card">
          <b>{v.titulo}</b> — {v.senioridade} — <i>{v.status}</i>
          <p>{v.descricao_publica}</p>
        </div>
      ))}
    </div>
  )
}
