'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      router.push('/app')
    } catch (err: any) {
      setError(err.message || 'Erro')
    } finally {
      setLoading(false)
    }
  }

  async function logout() { await supabase.auth.signOut() }

  return (
    <div style={{maxWidth:480}}>
      <h1>{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
      <form onSubmit={handleSubmit}>
        <label>E-mail</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Senha</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button type="submit" disabled={loading}>{loading ? 'Enviando...' : (mode==='login'?'Entrar':'Cadastrar')}</button>
          <button type="button" onClick={()=>setMode(mode==='login'?'signup':'login')}>
            {mode==='login' ? 'Criar conta' : 'Já tenho conta'}
          </button>
          <button type="button" onClick={logout}>Sair</button>
        </div>
        {error && <p style={{color:'crimson'}}>{error}</p>}
      </form>
      <p style={{marginTop:16}}>Após cadastro, um perfil é criado com papel <b>viewer</b>. Um admin pode promover seu usuário.</p>
    </div>
  )
}
