'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AppPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [role, setRole] = useState<string>('')

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserEmail(user?.email ?? null)
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
        setRole((data as any)?.role ?? 'viewer')
      }
    })()
  }, [])

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Usuário: {userEmail ?? '—'}</p>
      <p>Papel: <b>{role}</b></p>
      <ul>
        <li>Acesse <b>/candidatos</b> (recrutador/admin)</li>
        <li>Acesse <b>/vagas/gerenciar</b> (admin)</li>
      </ul>
    </div>
  )
}
