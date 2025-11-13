import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { user } } = await supabase.auth.getUser()

  const url = new URL(req.url)
  const privatePaths = ['/app', '/candidatos', '/vagas/gerenciar', '/auditoria']

  if (privatePaths.some(p => url.pathname.startsWith(p)) && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return res
}

export const config = {
  matcher: ['/((?!_next|favicon.ico|images|public|api/public).*)'],
}
