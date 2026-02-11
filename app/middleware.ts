import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  // Renovar a sessão se ainda for válida
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  // Se não tiver usuário, permitir acesso a auth/callback e página de login
  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next()
  }

  // Se tiver usuário, permitir acesso a tudo
  if (user) {
    return NextResponse.next()
  }

  // Se não tiver sessão válida e não estiver em auth, redirecionar para home
  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
