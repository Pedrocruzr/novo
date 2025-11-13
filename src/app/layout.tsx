import './globals.css'
import Link from 'next/link'

export const metadata = { title: 'Recruit Secure App', description: 'RH com segurança (Supabase + RLS)' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <header style={{padding:'12px', borderBottom:'1px solid #eee', display:'flex', gap:12}}>
          <Link href="/">Home</Link>
          <Link href="/app">Dashboard</Link>
          <Link href="/candidatos">Candidatos</Link>
          <Link href="/vagas/gerenciar">Gerenciar Vagas</Link>
          <Link href="/login">Login</Link>
        </header>
        <main style={{padding:'16px'}}>{children}</main>
      </body>
    </html>
  )
}
