import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // O uso da URL completa com origin evita falhas de redirecionamento relativo
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Se falhar, volta para o login para feedback ao usuário
  return NextResponse.redirect(`${origin}/login`)
}